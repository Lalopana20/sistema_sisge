const ProductoService = require('../services/productoService');
const audit           = require('../helpers/auditoriaHelper');

const ProductoController = {
  async listar(req, res, next) {
    try {
      const data = await ProductoService.listar(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const data = await ProductoService.obtener(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const data = await ProductoService.crear(req.body);
      await audit.registrar(req, {
        accion: 'CREAR',
        modulo: 'productos',
        entidad_id: data.id,
        entidad_nombre: data.nombre,
        detalle: { despues: data },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      // obtener estado anterior ANTES de modificar (una sola consulta)
      const antes = await ProductoService.obtener(req.params.id);
      const data  = await ProductoService.actualizar(req.params.id, req.body);
      await audit.registrar(req, {
        accion: 'EDITAR',
        modulo: 'productos',
        entidad_id: data.id,
        entidad_nombre: data.nombre,
        detalle: {
          antes: { nombre: antes.nombre, id_categoria: antes.id_categoria, stock_minimo: antes.stock_minimo },
          despues: { nombre: data.nombre, id_categoria: data.id_categoria, stock_minimo: data.stock_minimo },
        },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const antes = await ProductoService.obtener(req.params.id);
      const data  = await ProductoService.eliminar(req.params.id);
      await audit.registrar(req, {
        accion: 'ELIMINAR',
        modulo: 'productos',
        entidad_id: antes.id,
        entidad_nombre: antes.nombre,
        detalle: { antes },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async ajustarStock(req, res, next) {
    try {
      const antes = await ProductoService.obtener(req.params.id);
      const data  = await ProductoService.ajustarStock(req.params.id, req.body.stock_actual, req.usuario.id);
      await audit.registrar(req, {
        accion: 'AJUSTAR_STOCK',
        modulo: 'productos',
        entidad_id: data.id,
        entidad_nombre: data.nombre,
        detalle: { antes: { stock_actual: antes.stock_actual }, despues: { stock_actual: data.stock_actual } },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async stockBajo(req, res, next) {
    try {
      const data = await ProductoService.stockBajo();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async historial(req, res, next) {
    try {
      const data = await ProductoService.historial(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = ProductoController;
