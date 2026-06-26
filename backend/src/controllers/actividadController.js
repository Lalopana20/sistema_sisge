const ActividadService = require('../services/actividadService');

const ActividadController = {
  async listar(req, res, next) {
    try {
      const data = await ActividadService.listar({
        id_usuario: req.usuario.id,
        page: req.query.page,
        limit: req.query.limit,
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = ActividadController;
