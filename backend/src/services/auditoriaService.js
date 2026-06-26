const AuditoriaModel = require('../models/auditoriaModel');

const AuditoriaService = {
  async listar(filtros) {
    return AuditoriaModel.listar(filtros);
  },
};

module.exports = AuditoriaService;
