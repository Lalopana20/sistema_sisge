const Joi = require('joi');

const upsert = Joi.object({
  id_categoria: Joi.number().integer().required(),
  nombre:       Joi.string().min(2).required(),
  descripcion:  Joi.string().allow('', null).optional(),
});

module.exports = { upsert };
