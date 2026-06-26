const NotificacionService = require('../services/notificacionService');
const audit               = require('../helpers/auditoriaHelper');

const NotificacionController = {
  async listar(req, res, next) {
    try {
      const data = await NotificacionService.listar(req.usuario.id, req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async noLeidas(req, res, next) {
    try {
      const total = await NotificacionService.noLeidas(req.usuario.id);
      res.json({ success: true, data: { total } });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const data = await NotificacionService.crear(req.body);
      await audit.registrar(req, {
        accion: 'CREAR',
        modulo: 'notificaciones',
        entidad_id: data.id,
        entidad_nombre: data.titulo,
        detalle: { id_usuario_destino: data.id_usuario, tipo: data.tipo, titulo: data.titulo },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async marcarLeida(req, res, next) {
    try {
      const data = await NotificacionService.marcarLeida(req.params.id, req.usuario.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async marcarTodasLeidas(req, res, next) {
    try {
      const data = await NotificacionService.marcarTodasLeidas(req.usuario.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = NotificacionController;
