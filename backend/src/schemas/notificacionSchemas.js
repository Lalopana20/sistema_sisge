const Joi = require('joi');

const crear = Joi.object({
  id_usuario: Joi.number().integer().required(),
  tipo:       Joi.string().valid('INFO', 'ADVERTENCIA', 'ERROR', 'EXITO').default('INFO'),
  titulo:     Joi.string().min(2).max(150).required(),
  mensaje:    Joi.string().allow('', null).optional(),
  url:        Joi.string().uri({ allowRelative: true }).allow('', null).optional(),
});

module.exports = { crear };
