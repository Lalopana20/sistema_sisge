/**
 * Seed: datos recientes para que el Dashboard muestre KPIs con valores > 0
 *
 * Crea movimientos de hoy y ajusta stocks para que los indicadores
 * del Dashboard se vean con datos. Ejecutar:  node src/seed/seedDatosRecientes.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'sisge_almacen',
  });

  const [users] = await conn.query('SELECT id, nombre FROM usuarios WHERE activo = 1');
  const adminId = users.find(u => u.nombre === 'Fernando').id;
  const tecnicos = users.filter(u => ['Santiago', 'Alvaro', 'Rodolfo', 'Antonio'].includes(u.nombre));
  const [prods] = await conn.query('SELECT id, nombre, stock_actual, stock_minimo FROM productos WHERE activo = 1');

  if (prods.length === 0) { console.log('No hay productos. Ejecuta primero seed inicial.'); process.exit(1); }

  // 1. Crear movimientos de ENTRADA hoy para algunos productos
  console.log('Creando movimientos de ENTRADA (hoy)...');
  for (let i = 0; i < 3; i++) {
    const p = prods[i];
    const cantidad = Math.floor(Math.random() * 10) + 2;
    const stockAnterior = Number(p.stock_actual);
    const stockNuevo = parseFloat((stockAnterior + cantidad).toFixed(2));
    await conn.query(
      `INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, fecha)
       VALUES (?, 'ENTRADA', ?, ?, ?, 'Reposición de stock', ?, NOW())`,
      [p.id, cantidad, stockAnterior, stockNuevo, adminId],
    );
    await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [stockNuevo, p.id]);
    p.stock_actual = stockNuevo;
  }

  // 2. Crear movimientos de SALIDA hoy (con ubicaciones)
  console.log('Creando movimientos de SALIDA (hoy)...');
  const fechasEsperadas = [
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  ];
  const ubicaciones = ['Obra Puente Los Maestros', 'Local Sede Central - Piso 3', 'Taller Mecánico Sur'];

  for (let i = 0; i < 3; i++) {
    const p = prods[prods.length - 1 - i];
    const tec = tecnicos[i % tecnicos.length];
    const cantidad = 1;
    const stockAnterior = Number(p.stock_actual);
    const stockNuevo = parseFloat(Math.max(stockAnterior - cantidad, 0).toFixed(2));

    if (stockAnterior <= 0) continue;

    await conn.query(
      `INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, id_tecnico, fecha)
       VALUES (?, 'SALIDA', ?, ?, ?, 'Material para trabajo en campo', ?, ?, NOW())`,
      [p.id, cantidad, stockAnterior, stockNuevo, adminId, tec.id],
    );
    const movId = (await conn.query('SELECT LAST_INSERT_ID() AS id'))[0][0].id;

    await conn.query(
      `INSERT INTO ubicaciones_material (id_movimiento, id_producto, id_tecnico, ubicacion, motivo, descripcion, estado, fecha_esperada_dev, id_reportado_por, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Trabajo programado', 'Material asignado para obra en curso', 'EN_USO', ?, ?, NOW(), NOW())`,
      [movId, p.id, tec.id, ubicaciones[i], fechasEsperadas[i], adminId],
    );
    await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [stockNuevo, p.id]);
    p.stock_actual = stockNuevo;
  }

  // 3. Ajustar stock_minimo para que algunos productos aparezcan como stock_bajo
  console.log('Ajustando stocks mínimos para stock crítico...');
  const targetBajo = prods.filter(p => Number(p.stock_actual) > 0 && Number(p.stock_actual) <= 3);
  for (const p of targetBajo.slice(0, 3)) {
    await conn.query('UPDATE productos SET stock_minimo = ? WHERE id = ?', [Number(p.stock_actual), p.id]);
  }

  // 4. Asegurar que Alertas campo tenga al menos 1 con fecha vencida
  console.log('Actualizando fecha esperada vencida para alertas...');
  const [ubiActivas] = await conn.query(
    "SELECT id FROM ubicaciones_material WHERE estado != 'DEVUELTO' ORDER BY id LIMIT 1",
  );
  if (ubiActivas.length > 0) {
    const hace8Dias = new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10);
    await conn.query(
      'UPDATE ubicaciones_material SET fecha_esperada_dev = ? WHERE id = ?',
      [hace8Dias, ubiActivas[0].id],
    );
  }

  await conn.end();
  console.log('Seed completado — datos recientes creados correctamente.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
