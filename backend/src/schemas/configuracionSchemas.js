const Joi = require('joi');

const crear = Joi.object({
  clave:       Joi.string().min(2).max(100).required(),
  valor:       Joi.string().max(500).required(),
  descripcion: Joi.string().allow('', null).max(255).optional(),
});

const actualizar = Joi.object({
  valor:       Joi.string().max(500).required(),
  descripcion: Joi.string().allow('', null).max(255).optional(),
});

module.exports = { crear, actualizar };
