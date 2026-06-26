const Joi = require('joi');

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>?/~`]).{8,128}$/;
const PASSWORD_MSG = 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial';

const crear = Joi.object({
  nombre:   Joi.string().min(2).required(),
  username: Joi.string().min(3).alphanum().required(),
  email:    Joi.string().email().allow('', null).optional(),
  password: Joi.string().min(8).max(128).pattern(PASSWORD_PATTERN).required()
    .messages({ 'string.pattern.base': PASSWORD_MSG }),
  rol:      Joi.string().valid('admin', 'operario', 'supervisor').default('operario'),
});

const actualizar = Joi.object({
  nombre:   Joi.string().min(2).optional(),
  username: Joi.string().min(3).alphanum().optional(),
  email:    Joi.string().email().allow('', null).optional(),
  password: Joi.string().min(8).max(128).pattern(PASSWORD_PATTERN).optional()
    .messages({ 'string.pattern.base': PASSWORD_MSG }),
  rol:      Joi.string().valid('admin', 'operario', 'supervisor').optional(),
}).min(1);

const cambiarEstado = Joi.object({
  activo: Joi.boolean().required(),
});

module.exports = { crear, actualizar, cambiarEstado };
