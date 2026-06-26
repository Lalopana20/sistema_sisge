const Joi = require('joi');

const ESTADOS_VALIDOS = ['EN_USO', 'EN_OBRA', 'PENDIENTE_DEV', 'EXTRAVIADO', 'DEVUELTO'];

const crear = Joi.object({
  id_movimiento:      Joi.number().integer().required(),
  ubicacion:          Joi.string().min(3).max(200).required(),
  motivo:             Joi.string().min(3).max(200).required(),
  descripcion:        Joi.string().max(1000).allow('', null).optional(),
  estado:             Joi.string().valid(...ESTADOS_VALIDOS).default('EN_USO'),
  fecha_esperada_dev: Joi.date().iso().allow(null).optional(),
});

const actualizar = Joi.object({
  ubicacion:          Joi.string().min(3).max(200).optional(),
  motivo:             Joi.string().min(3).max(200).optional(),
  descripcion:        Joi.string().max(1000).allow('', null).optional(),
  estado:             Joi.string().valid(...ESTADOS_VALIDOS).optional(),
  fecha_esperada_dev: Joi.date().iso().allow(null).optional(),
}).min(1);

const cerrar = Joi.object({
  nota_cierre: Joi.string().max(500).allow('', null).optional(),
});

module.exports = { crear, actualizar, cerrar };
