const MovimientoService = require('../services/movimientoService');
const audit             = require('../helpers/auditoriaHelper');

const MovimientoController = {
  async registrar(req, res, next) {
    try {
      const data = await MovimientoService.registrar(req.body, req.usuario.id);
      await audit.registrar(req, {
        accion: 'REGISTRAR_MOVIMIENTO',
        modulo: 'movimientos',
        entidad_id: data.id,
        entidad_nombre: `${data.tipo} — ${data.producto}`,
        detalle: {
          tipo: data.tipo,
          producto: data.producto,
          cantidad: data.cantidad,
          stock_anterior: data.stock_anterior,
          stock_nuevo: data.stock_nuevo,
        },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async listar(req, res, next) {
    try {
      const data = await MovimientoService.listar(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const antes = await MovimientoService.obtener(req.params.id);
      const data  = await MovimientoService.actualizar(req.params.id, req.body);
      await audit.registrar(req, {
        accion: 'EDITAR',
        modulo: 'movimientos',
        entidad_id: data.id,
        entidad_nombre: `${data.tipo} — ${data.producto}`,
        detalle: {
          antes: { motivo: antes.motivo, referencia_doc: antes.referencia_doc, observaciones: antes.observaciones },
          despues: { motivo: data.motivo, referencia_doc: data.referencia_doc, observaciones: data.observaciones },
        },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const data = await MovimientoService.obtener(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = MovimientoController;
