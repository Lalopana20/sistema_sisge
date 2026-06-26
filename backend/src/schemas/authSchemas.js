const Joi = require('joi');

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>?/~`]).{8,128}$/;
const PASSWORD_MSG = 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial';

const login = Joi.object({
  username: Joi.string().min(3).max(50).pattern(/^[a-zA-Z0-9_.-]+$/).required()
    .messages({ 'string.pattern.base': 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos' }),
  password: Joi.string().min(1).required(),
});

const registro = Joi.object({
  nombre:   Joi.string().min(2).required(),
  username: Joi.string().min(3).alphanum().required(),
  email:    Joi.string().email().allow('', null).optional(),
  password: Joi.string().min(8).max(128).pattern(PASSWORD_PATTERN).required()
    .messages({ 'string.pattern.base': PASSWORD_MSG }),
  rol:      Joi.string().valid('admin', 'operario', 'supervisor').default('operario'),
});

const password = Joi.object({
  password_actual: Joi.string().min(8).max(128).required(),
  password_nueva:  Joi.string().min(8).max(128).pattern(PASSWORD_PATTERN).required()
    .messages({ 'string.pattern.base': PASSWORD_MSG }),
});

module.exports = { login, registro, password };
