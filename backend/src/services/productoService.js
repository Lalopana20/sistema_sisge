const ProductoModel      = require('../models/productoModel');
const CategoriaModel     = require('../models/categoriaModel');
const SubcategoriaModel  = require('../models/subcategoriaModel');
const MovimientoService  = require('./movimientoService');

const httpError = (status, message) => {
  const err = new Error(message); err.status = status; return err;
};

const validarSubcategoria = async (id_subcategoria, id_categoria) => {
  if (!id_subcategoria) return;
  const sub = await SubcategoriaModel.findById(id_subcategoria);
  if (!sub) {
    throw httpError(400, 'La subcategoría no existe');
  }
  // ✅ CORRECCIÓN URGENTE 3: Validar subcategoría activa
  if (sub.activo === 0 || sub.activo === false) {
    throw httpError(400, 'No se puede asignar una subcategoría inactiva. Reactívala primero.');
  }
  if (sub.id_categoria !== Number(id_categoria)) {
    throw httpError(400, 'La subcategoría no pertenece a la categoría seleccionada');
  }
};

const ProductoService = {
  async listar(filtros) {
    return ProductoModel.listar(filtros);
  },

  async obtener(id) {
    const prod = await ProductoModel.findById(id);
    if (!prod) throw httpError(404, 'Producto no encontrado');
    return prod;
  },

  async crear(datos) {
    // ✅ CORRECCIÓN URGENTE 3: Validar categoría activa
    const cat = await CategoriaModel.findById(datos.id_categoria);
    if (!cat) {
      throw httpError(400, 'La categoría no existe');
    }
    if (cat.activo === 0 || cat.activo === false) {
      throw httpError(400, 'No se puede asignar una categoría inactiva. Reactívala primero.');
    }

    await validarSubcategoria(datos.id_subcategoria, datos.id_categoria);
    const id = await ProductoModel.crear({ ...datos, stock_actual: 0 });
    return ProductoModel.findById(id);
  },

  async actualizar(id, datos) {
    const actual = await this.obtener(id);

    // ✅ CORRECCIÓN IMPORTANTE 4: Bloquear edición de productos eliminados
    if (actual.activo === 0 || actual.activo === false) {
      throw httpError(400, 'No se puede editar un producto eliminado. Reactívalo primero desde la papelera.');
    }

    const idCat  = datos.id_categoria ?? actual.id_categoria;

    // ✅ CORRECCIÓN URGENTE 3: Validar categoría activa en actualización
    if (datos.id_categoria !== undefined) {
      const cat = await CategoriaModel.findById(datos.id_categoria);
      if (!cat) {
        throw httpError(400, 'La categoría no existe');
      }
      if (cat.activo === 0 || cat.activo === false) {
        throw httpError(400, 'No se puede asignar una categoría inactiva. Reactívala primero.');
      }
    }

    const idSub = datos.id_subcategoria !== undefined ? datos.id_subcategoria : actual.id_subcategoria;
    await validarSubcategoria(idSub, idCat);

    // Fusionar con los valores actuales para que el UPDATE no sobreescriba
    // campos no enviados con undefined (el model hace UPDATE de todos los campos)
    const datosCompletos = {
      nombre:          datos.nombre          ?? actual.nombre,
      descripcion:     datos.descripcion     !== undefined ? datos.descripcion : actual.descripcion,
      id_categoria:    datos.id_categoria    ?? actual.id_categoria,
      id_subcategoria: datos.id_subcategoria !== undefined ? datos.id_subcategoria : actual.id_subcategoria,
      stock_minimo:    datos.stock_minimo    ?? actual.stock_minimo,
      unidad_medida:   datos.unidad_medida   ?? actual.unidad_medida,
    };

    await ProductoModel.actualizar(id, datosCompletos);
    return ProductoModel.findById(id);
  },

  async eliminar(id) {
    const prod = await this.obtener(id);
    if (prod.stock_actual > 0) {
      throw httpError(400,
        `No se puede eliminar "${prod.nombre}" porque tiene ${prod.stock_actual} unidades en stock. Ajuste el stock a 0 primero.`,
      );
    }
    await ProductoModel.eliminar(id);
    return { mensaje: 'Producto eliminado correctamente' };
  },

  async ajustarStock(id, stock_actual, id_usuario) {
    const prod = await this.obtener(id);

    // ✅ CORRECCIÓN IMPORTANTE 4: Bloquear ajuste de stock en productos eliminados
    if (prod.activo === 0 || prod.activo === false) {
      throw httpError(400, 'No se puede ajustar stock de un producto eliminado. Reactívalo primero.');
    }

    await MovimientoService.registrar({
      id_producto: Number(id),
      tipo: 'AJUSTE',
      cantidad: stock_actual,
      motivo: 'Ajuste manual de stock',
      observaciones: `Stock ajustado de ${prod.stock_actual} a ${stock_actual}`,
    }, id_usuario);
    return ProductoModel.findById(id);
  },

  async stockBajo() {
    return ProductoModel.stockBajo();
  },

  async historial(id) {
    const prod = await this.obtener(id);
    const db = require('../config/db');
    const [movimientos] = await db.query(
      `SELECT m.id, m.tipo, m.cantidad, m.stock_anterior, m.stock_nuevo,
              m.motivo, m.referencia_doc, m.fecha,
              u.nombre AS usuario, t.nombre AS tecnico
       FROM movimientos m
       JOIN usuarios u ON m.id_usuario = u.id
       LEFT JOIN usuarios t ON m.id_tecnico = t.id
       WHERE m.id_producto = ?
       ORDER BY m.fecha DESC`,
      [id],
    );
    const [ubicaciones] = await db.query(
      `SELECT u.id, u.ubicacion, u.estado, u.motivo, u.descripcion,
              u.fecha_esperada_dev, u.fecha_devolucion, u.created_at,
              t.nombre AS tecnico
       FROM ubicaciones_material u
       JOIN usuarios t ON u.id_tecnico = t.id
       WHERE u.id_producto = ?
       ORDER BY u.created_at DESC`,
      [id],
    );
    return { producto: prod, movimientos, ubicaciones };
  },
};

module.exports = ProductoService;
