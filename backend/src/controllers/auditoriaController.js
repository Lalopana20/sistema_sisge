const AuditoriaService = require('../services/auditoriaService');

const AuditoriaController = {
  async listar(req, res, next) {
    try {
      const data = await AuditoriaService.listar(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = AuditoriaController;
