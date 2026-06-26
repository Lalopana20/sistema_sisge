const Joi = require('joi');

const upsert = Joi.object({
  nombre:      Joi.string().min(2).required(),
  descripcion: Joi.string().allow('', null).optional(),
});

module.exports = { upsert };
