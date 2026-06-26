const db = require('../config/db');
const CategoriaModel = require('../models/categoriaModel');

const httpError = (status, message) => {
  const err = new Error(message); err.status = status; return err;
};

const CategoriaService = {
  async listar(filtros) {
    return CategoriaModel.listar(filtros);
  },

  async obtener(id) {
    const cat = await CategoriaModel.findById(id);
    if (!cat) throw httpError(404, 'Categoría no encontrada');
    return cat;
  },

  async crear(datos) {
    const id = await CategoriaModel.crear(datos);
    return CategoriaModel.findById(id);
  },

  async actualizar(id, datos) {
    const cat = await this.obtener(id);

    // ✅ CORRECCIÓN IMPORTANTE 4: Bloquear edición de categorías eliminadas
    if (cat.activo === 0 || cat.activo === false) {
      throw httpError(400, 'No se puede editar una categoría eliminada. Reactívala primero desde la papelera.');
    }

    await CategoriaModel.actualizar(id, datos);
    return CategoriaModel.findById(id);
  },

  async eliminar(id) {
    await this.obtener(id);
    const [[{ productos }]] = await db.query(
      'SELECT COUNT(*) AS productos FROM productos WHERE id_categoria = ? AND activo = 1', [id],
    );
    if (productos > 0) {
      throw httpError(400, `No se puede eliminar: tiene ${productos} producto(s) activo(s). Reasígnelos o elimínelos primero.`);
    }
    const [[{ subcats }]] = await db.query(
      'SELECT COUNT(*) AS subcats FROM subcategorias WHERE id_categoria = ? AND COALESCE(activo, 1) = 1', [id],
    );
    if (subcats > 0) {
      throw httpError(400, `No se puede eliminar: tiene ${subcats} subcategoría(s) activa(s). Elimínelas primero.`);
    }
    const filas = await CategoriaModel.eliminar(id);
    if (!filas) throw httpError(400, 'No se pudo eliminar la categoría');
    return { mensaje: 'Categoría eliminada correctamente' };
  },
};

module.exports = CategoriaService;
