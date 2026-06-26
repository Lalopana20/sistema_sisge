const db = require('../config/db');
const SubcategoriaModel = require('../models/subcategoriaModel');
const CategoriaModel    = require('../models/categoriaModel');

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const SubcategoriaService = {
  async listar(filtros) {
    return SubcategoriaModel.listar(filtros);
  },

  async obtener(id) {
    const sub = await SubcategoriaModel.findById(id);
    if (!sub) throw httpError(404, 'Subcategoría no encontrada');
    return sub;
  },

  async crear(datos) {
    const cat = await CategoriaModel.findById(datos.id_categoria);
    if (!cat) throw httpError(400, 'La categoría no existe');
    const id = await SubcategoriaModel.crear(datos);
    return SubcategoriaModel.findById(id);
  },

  async actualizar(id, datos) {
    const sub = await this.obtener(id);

    // ✅ CORRECCIÓN IMPORTANTE 4: Bloquear edición de subcategorías eliminadas
    if (sub.activo === 0 || sub.activo === false) {
      throw httpError(400, 'No se puede editar una subcategoría eliminada. Reactívala primero desde la papelera.');
    }

    if (datos.id_categoria) {
      const cat = await CategoriaModel.findById(datos.id_categoria);
      if (!cat) throw httpError(400, 'La categoría no existe');
    }
    await SubcategoriaModel.actualizar(id, datos);
    return SubcategoriaModel.findById(id);
  },

  async eliminar(id) {
    await this.obtener(id);
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM productos WHERE id_subcategoria = ? AND activo = 1', [id],
    );
    if (total > 0) {
      throw httpError(400, `No se puede eliminar: tiene ${total} producto(s) activo(s) asociado(s). Reasígnelos o elimínelos primero.`);
    }
    await SubcategoriaModel.eliminar(id);
    return { mensaje: 'Subcategoría eliminada correctamente' };
  },
};

module.exports = SubcategoriaService;
