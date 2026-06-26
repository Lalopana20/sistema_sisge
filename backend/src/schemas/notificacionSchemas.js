const Joi = require('joi');

const TIPOS_VALIDOS = [
  'INFO', 'ADVERTENCIA', 'ERROR', 'EXITO',
  'STOCK_BAJO', 'STOCK_RECUPERADO',
  'DEVOLUCION_VENCIDA', 'DEVOLUCION_PROXIMA',
  'MATERIAL_EXTRAVIADO'
];

const crear = Joi.object({
  id_usuario: Joi.number().integer().required(),
  tipo:       Joi.string().valid(...TIPOS_VALIDOS).default('INFO'),
  titulo:     Joi.string().min(2).max(150).required(),
  mensaje:    Joi.string().allow('', null).optional(),
  url:        Joi.string().uri({ allowRelative: true }).allow('', null).optional(),
});

module.exports = { crear, TIPOS_VALIDOS };
