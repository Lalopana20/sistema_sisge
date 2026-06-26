const Joi = require('joi');

const crear = Joi.object({
  nombre:           Joi.string().min(2).required(),
  descripcion:      Joi.string().allow('', null).optional(),
  id_categoria:     Joi.number().integer().required(),
  id_subcategoria:  Joi.number().integer().allow(null).optional(),
  stock_minimo:     Joi.number().min(0).default(0),
  unidad_medida:    Joi.string().default('unidad'),
});

const actualizar = Joi.object({
  nombre:           Joi.string().min(2).required(),
  descripcion:      Joi.string().allow('', null).optional(),
  id_categoria:     Joi.number().integer().required(),
  id_subcategoria:  Joi.number().integer().allow(null).optional(),
  stock_minimo:     Joi.number().min(0).default(0),
  unidad_medida:    Joi.string().default('unidad'),
});

const ajustarStock = Joi.object({
  stock_actual: Joi.number().min(0).required(),
});

module.exports = { crear, actualizar, ajustarStock };
