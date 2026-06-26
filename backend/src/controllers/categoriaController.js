const CategoriaService = require('../services/categoriaService');
const audit            = require('../helpers/auditoriaHelper');

const CategoriaController = {
  async listar(req, res, next) {
    try {
      const data = await CategoriaService.listar(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const data = await CategoriaService.obtener(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const data = await CategoriaService.crear(req.body);
      await audit.registrar(req, {
        accion: 'CREAR',
        modulo: 'categorias',
        entidad_id: data.id,
        entidad_nombre: data.nombre,
        detalle: { despues: data },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const antes = await CategoriaService.obtener(req.params.id);
      const data  = await CategoriaService.actualizar(req.params.id, req.body);
      await audit.registrar(req, {
        accion: 'EDITAR',
        modulo: 'categorias',
        entidad_id: data.id,
        entidad_nombre: data.nombre,
        detalle: { antes, despues: data },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const antes = await CategoriaService.obtener(req.params.id);
      const data  = await CategoriaService.eliminar(req.params.id);
      await audit.registrar(req, {
        accion: 'ELIMINAR',
        modulo: 'categorias',
        entidad_id: antes.id,
        entidad_nombre: antes.nombre,
        detalle: { antes },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = CategoriaController;
