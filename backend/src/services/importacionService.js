/**
 * importacionService.js
 * Parsea archivos Excel, PDF y Word, detecta automáticamente
 * a qué tabla pertenecen los datos y los inserta en la BD.
 */
const ExcelJS  = require('exceljs');
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const db       = require('../config/db');

// ── Tablas soportadas y sus columnas esperadas ────────────────────────────────
const TABLAS = {
  productos: {
    label:    'Productos',
    columnas: ['nombre', 'descripcion', 'id_categoria', 'stock_actual', 'stock_minimo', 'unidad_medida'],
    aliases:  {
      nombre:        ['nombre', 'producto', 'item', 'artículo', 'articulo', 'descripcion_producto'],
      descripcion:   ['descripcion', 'descripción', 'detalle', 'observacion', 'observación'],
      id_categoria:  ['id_categoria', 'categoria', 'categoría', 'category'],
      stock_actual:  ['stock_actual', 'stock', 'cantidad', 'existencia', 'existencias', 'qty'],
      stock_minimo:  ['stock_minimo', 'stock_min', 'minimo', 'mínimo', 'min_stock'],
      unidad_medida: ['unidad_medida', 'unidad', 'um', 'unit', 'medida'],
    },
    requeridos: ['nombre'],
  },
  categorias: {
    label:    'Categorías',
    columnas: ['nombre', 'descripcion'],
    aliases:  {
      nombre:      ['nombre', 'categoria', 'categoría', 'name'],
      descripcion: ['descripcion', 'descripción', 'detalle'],
    },
    requeridos: ['nombre'],
  },
  movimientos: {
    label:    'Movimientos',
    columnas: ['id_producto', 'tipo', 'cantidad', 'motivo', 'referencia_doc'],
    aliases:  {
      id_producto:    ['id_producto', 'producto', 'item', 'articulo', 'artículo'],
      tipo:           ['tipo', 'type', 'movimiento', 'operacion', 'operación'],
      cantidad:       ['cantidad', 'qty', 'quantity', 'amount'],
      motivo:         ['motivo', 'razon', 'razón', 'reason', 'descripcion'],
      referencia_doc: ['referencia_doc', 'referencia', 'documento', 'doc', 'nro', 'numero'],
    },
    requeridos: ['tipo', 'cantidad'],
  },
};

// ── Normalizar texto para comparación ────────────────────────────────────────
const norm = (s) =>
  String(s || '').toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ── Detectar a qué campo de la tabla corresponde un encabezado ───────────────
function detectarCampo(header, tabla) {
  const h = norm(header);
  for (const [campo, aliases] of Object.entries(TABLAS[tabla].aliases)) {
    if (aliases.some(a => norm(a) === h || h.includes(norm(a)))) return campo;
  }
  return null;
}

// ── Detectar qué tabla corresponde a un conjunto de encabezados ──────────────
function detectarTabla(headers) {
  const normed = headers.map(norm);
  let mejorTabla = null;
  let mejorScore = 0;

  for (const [tabla, cfg] of Object.entries(TABLAS)) {
    let score = 0;
    for (const aliases of Object.values(cfg.aliases)) {
      if (aliases.some(a => normed.some(h => h === norm(a) || h.includes(norm(a))))) {
        score++;
      }
    }
    // Bonus si tiene todos los campos requeridos
    const tieneRequeridos = cfg.requeridos.every(req =>
      Object.entries(cfg.aliases).some(([campo, aliases]) =>
        campo === req && aliases.some(a => normed.some(h => h === norm(a) || h.includes(norm(a))))
      )
    );
    if (tieneRequeridos) score += 3;
    if (score > mejorScore) { mejorScore = score; mejorTabla = tabla; }
  }

  return mejorScore >= 1 ? mejorTabla : null;
}

// ── Resolver id_categoria desde nombre ───────────────────────────────────────
// NOTA: ya NO crea categorías automáticamente — solo busca existentes.
// La creación automática sin autorización es un riesgo de seguridad.
async function resolverCategoria(valor) {
  if (!valor) return null;
  if (!isNaN(valor)) return Number(valor);
  const [rows] = await db.query(
    'SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?) LIMIT 1', [String(valor).trim()]
  );
  if (rows.length) return rows[0].id;
  // Categoría no encontrada — devolver null para que el llamador decida
  return null;
}

// ── Resolver id_producto desde nombre ────────────────────────────────────────
async function resolverProducto(valor) {
  if (!valor) return null;
  if (!isNaN(valor)) return Number(valor);
  const [rows] = await db.query(
    'SELECT id FROM productos WHERE LOWER(nombre) LIKE LOWER(?) AND activo = 1 LIMIT 1',
    [`%${String(valor).trim()}%`]
  );
  return rows.length ? rows[0].id : null;
}

// ── Parsear Excel (.xlsx / .xls) ─────────────────────────────────────────────
async function parsearExcel(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const hojas = [];
  workbook.eachSheet((sheet) => {
    const filas = [];
    let headers = [];

    sheet.eachRow((row, rowNum) => {
      const valores = row.values.slice(1); // ExcelJS indexa desde 1
      if (rowNum === 1) {
        headers = valores.map(v => String(v || '').trim());
      } else {
        if (valores.some(v => v !== null && v !== undefined && v !== '')) {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = valores[i] ?? null; });
          filas.push(obj);
        }
      }
    });

    if (headers.length && filas.length) {
      hojas.push({ nombre: sheet.name, headers, filas });
    }
  });

  return hojas;
}

// ── Parsear PDF (extrae texto y lo convierte en filas) ────────────────────────
async function parsearPDF(buffer) {
  const { text } = await pdfParse(buffer);
  const lineas = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Intentar detectar tabla: buscar línea con separadores o múltiples columnas
  const filas = [];
  let headers = [];

  for (const linea of lineas) {
    // Separadores comunes: | ; \t múltiples espacios
    const partes = linea.split(/\s{2,}|\t|\|/).map(p => p.trim()).filter(Boolean);
    if (partes.length >= 2) {
      if (!headers.length) {
        headers = partes;
      } else {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = partes[i] ?? null; });
        filas.push(obj);
      }
    }
  }

  if (!headers.length || !filas.length) {
    // Fallback: intentar parsear como lista nombre:valor
    const obj = {};
    for (const linea of lineas) {
      const match = linea.match(/^([^:]+):\s*(.+)$/);
      if (match) obj[match[1].trim()] = match[2].trim();
    }
    if (Object.keys(obj).length) {
      headers = Object.keys(obj);
      filas.push(obj);
    }
  }

  return headers.length ? [{ nombre: 'PDF', headers, filas }] : [];
}

// ── Parsear Word (.docx) ──────────────────────────────────────────────────────
async function parsearWord(buffer) {
  const { value: html } = await mammoth.convertToHtml({ buffer });

  // Extraer tablas del HTML
  const hojas = [];
  const tablaRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tablaMatch;

  while ((tablaMatch = tablaRegex.exec(html)) !== null) {
    const tablaHtml = tablaMatch[1];
    const filaRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const filas = [];
    let headers = [];
    let filaMatch;

    while ((filaMatch = filaRegex.exec(tablaHtml)) !== null) {
      const celdaRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const celdas = [];
      let celdaMatch;
      while ((celdaMatch = celdaRegex.exec(filaMatch[1])) !== null) {
        celdas.push(celdaMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (!headers.length) {
        headers = celdas;
      } else if (celdas.some(c => c)) {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = celdas[i] ?? null; });
        filas.push(obj);
      }
    }

    if (headers.length && filas.length) {
      hojas.push({ nombre: `Tabla ${hojas.length + 1}`, headers, filas });
    }
  }

  // Si no hay tablas, intentar parsear párrafos como lista
  if (!hojas.length) {
    const texto = html.replace(/<[^>]+>/g, '\n');
    const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    const obj = {};
    for (const linea of lineas) {
      const match = linea.match(/^([^:]+):\s*(.+)$/);
      if (match) obj[match[1].trim()] = match[2].trim();
    }
    if (Object.keys(obj).length) {
      hojas.push({ nombre: 'Documento', headers: Object.keys(obj), filas: [obj] });
    }
  }

  return hojas;
}

// ── Insertar filas en la BD ───────────────────────────────────────────────────
async function insertarFilas(tabla, filas, mapeo, id_usuario) {
  const resultados = { insertados: 0, errores: [], omitidos: 0 };

  for (const [idx, fila] of filas.entries()) {
    try {
      const datos = {};
      for (const [campoDestino, campoOrigen] of Object.entries(mapeo)) {
        if (campoOrigen && fila[campoOrigen] !== undefined) {
          datos[campoDestino] = fila[campoOrigen];
        }
      }

      // Validar campos requeridos
      const faltantes = TABLAS[tabla].requeridos.filter(r => !datos[r]);
      if (faltantes.length) {
        resultados.omitidos++;
        resultados.errores.push(`Fila ${idx + 2}: faltan campos requeridos (${faltantes.join(', ')})`);
        continue;
      }

      if (tabla === 'productos') {
        // Resolver categoría — ya NO crea categorías automáticamente
        if (datos.id_categoria) {
          const idCat = await resolverCategoria(datos.id_categoria);
          if (idCat === null) {
            resultados.errores.push(`Fila ${idx + 2}: categoría "${datos.id_categoria}" no encontrada`);
            resultados.omitidos++;
            continue;
          }
          datos.id_categoria = idCat;
        } else {
          // Categoría por defecto: primera disponible
          const [[cat]] = await db.query('SELECT id FROM categorias LIMIT 1');
          datos.id_categoria = cat?.id || null;
          if (!datos.id_categoria) {
            resultados.errores.push(`Fila ${idx + 2}: no hay categorías disponibles en el sistema`);
            resultados.omitidos++;
            continue;
          }
        }
        const stock = parseFloat(datos.stock_actual) || 0;
        const minimo = parseFloat(datos.stock_minimo) || 0;

        // Verificar si ya existe
        const [existe] = await db.query(
          'SELECT id FROM productos WHERE LOWER(nombre) = LOWER(?) AND activo = 1 LIMIT 1',
          [String(datos.nombre).trim()]
        );
        if (existe.length) {
          // Actualizar stock si ya existe
          await db.query(
            'UPDATE productos SET stock_actual = stock_actual + ?, stock_minimo = ? WHERE id = ?',
            [stock, minimo, existe[0].id]
          );
        } else {
          await db.query(
            `INSERT INTO productos (nombre, descripcion, id_categoria, stock_actual, stock_minimo, unidad_medida)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              String(datos.nombre).trim(),
              datos.descripcion || null,
              datos.id_categoria,
              stock,
              minimo,
              datos.unidad_medida || 'unidad',
            ]
          );
        }
        resultados.insertados++;

      } else if (tabla === 'categorias') {
        const [existe] = await db.query(
          'SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?) LIMIT 1',
          [String(datos.nombre).trim()]
        );
        if (!existe.length) {
          await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [String(datos.nombre).trim(), datos.descripcion || null]
          );
          resultados.insertados++;
        } else {
          resultados.omitidos++;
        }

      } else if (tabla === 'movimientos') {
        const tiposValidos = ['ENTRADA', 'SALIDA', 'DEVOLUCION', 'AJUSTE'];
        const tipo = String(datos.tipo || '').toUpperCase().trim();
        if (!tiposValidos.includes(tipo)) {
          resultados.errores.push(`Fila ${idx + 2}: tipo "${datos.tipo}" no válido`);
          resultados.omitidos++;
          continue;
        }

        const id_producto = await resolverProducto(datos.id_producto);
        if (!id_producto) {
          resultados.errores.push(`Fila ${idx + 2}: producto "${datos.id_producto}" no encontrado`);
          resultados.omitidos++;
          continue;
        }

        const cantidad = parseFloat(datos.cantidad);
        if (!cantidad || cantidad <= 0) {
          resultados.errores.push(`Fila ${idx + 2}: cantidad inválida`);
          resultados.omitidos++;
          continue;
        }

        // Obtener stock actual con bloqueo
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();
          const [[prod]] = await conn.query(
            'SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE', [id_producto]
          );
          const stockActual = parseFloat(prod.stock_actual || 0);
          let stockNuevo;
          if (tipo === 'ENTRADA' || tipo === 'DEVOLUCION') stockNuevo = stockActual + cantidad;
          else if (tipo === 'SALIDA') {
            if (stockActual < cantidad) {
              resultados.errores.push(`Fila ${idx + 2}: stock insuficiente (${stockActual} disponible)`);
              resultados.omitidos++;
              await conn.rollback();
              // No usar continue aquí: el finally garantiza conn.release()
              // Se lanza un error controlado para saltar al catch externo sin registrar error
              const skipErr = new Error('__SKIP__');
              skipErr.skip = true;
              throw skipErr;
            }
            stockNuevo = stockActual - cantidad;
          } else {
            stockNuevo = cantidad; // AJUSTE
          }

          await conn.query(
            `INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia_doc, id_usuario)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_producto, tipo, cantidad, stockActual, stockNuevo,
             datos.motivo || 'Importación masiva', datos.referencia_doc || null, id_usuario]
          );
          await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [stockNuevo, id_producto]);
          await conn.commit();
          resultados.insertados++;
        } catch (e) {
          await conn.rollback();
          if (!e.skip) throw e;
        } finally {
          conn.release();
        }
      }
    } catch (err) {
      resultados.errores.push(`Fila ${idx + 2}: ${err.message}`);
    }
  }

  return resultados;
}

// ── Función principal: procesar archivo ──────────────────────────────────────
async function procesarArchivo({ buffer, mimetype, originalname, tablaForzada, mapeoForzado, id_usuario }) {
  let hojas = [];

  const ext = originalname.split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel') {
    hojas = await parsearExcel(buffer);
  } else if (ext === 'pdf' || mimetype === 'application/pdf') {
    hojas = await parsearPDF(buffer);
  } else if (ext === 'docx' ||
             mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    hojas = await parsearWord(buffer);
  } else {
    throw Object.assign(new Error('Formato no soportado. Use .xlsx, .pdf o .docx'), { status: 400 });
  }

  if (!hojas.length) {
    throw Object.assign(new Error('No se encontraron datos en el archivo'), { status: 422 });
  }

  const resultadosPorHoja = [];

  for (const hoja of hojas) {
    const tabla = tablaForzada || detectarTabla(hoja.headers);

    if (!tabla) {
      resultadosPorHoja.push({
        hoja: hoja.nombre,
        tabla: null,
        detectado: false,
        mensaje: 'No se pudo detectar la tabla destino. Especifica la tabla manualmente.',
        filas: hoja.filas.length,
        preview: hoja.filas.slice(0, 3),
        headers: hoja.headers,
      });
      continue;
    }

    // Construir mapeo automático header → campo
    const mapeo = mapeoForzado || {};
    if (!mapeoForzado) {
      for (const header of hoja.headers) {
        const campo = detectarCampo(header, tabla);
        if (campo) mapeo[campo] = header;
      }
    }

    const resultado = await insertarFilas(tabla, hoja.filas, mapeo, id_usuario);

    resultadosPorHoja.push({
      hoja:       hoja.nombre,
      tabla,
      detectado:  !tablaForzada,
      headers:    hoja.headers,
      mapeo,
      filas:      hoja.filas.length,
      insertados: resultado.insertados,
      omitidos:   resultado.omitidos,
      errores:    resultado.errores,
      preview:    hoja.filas.slice(0, 3),
    });
  }

  return resultadosPorHoja;
}

// ── Vista previa sin insertar ─────────────────────────────────────────────────
async function previsualizarArchivo({ buffer, mimetype, originalname }) {
  let hojas = [];
  const ext = originalname.split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls' ||
      mimetype?.includes('spreadsheet') || mimetype?.includes('excel')) {
    hojas = await parsearExcel(buffer);
  } else if (ext === 'pdf' || mimetype === 'application/pdf') {
    hojas = await parsearPDF(buffer);
  } else if (ext === 'docx' || mimetype?.includes('wordprocessingml')) {
    hojas = await parsearWord(buffer);
  } else {
    throw Object.assign(new Error('Formato no soportado'), { status: 400 });
  }

  return hojas.map(hoja => ({
    hoja:     hoja.nombre,
    headers:  hoja.headers,
    filas:    hoja.filas.length,
    preview:  hoja.filas.slice(0, 5),
    tablaDetectada: detectarTabla(hoja.headers),
    mapeoSugerido: (() => {
      const tabla = detectarTabla(hoja.headers);
      if (!tabla) return {};
      const m = {};
      for (const h of hoja.headers) {
        const c = detectarCampo(h, tabla);
        if (c) m[c] = h;
      }
      return m;
    })(),
  }));
}

module.exports = { procesarArchivo, previsualizarArchivo, TABLAS };
