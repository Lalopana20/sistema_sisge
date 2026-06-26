const Joi = require('joi');

const crear = Joi.object({
  id_producto:          Joi.number().integer().required(),
  tipo:                 Joi.string().valid('ENTRADA', 'SALIDA', 'DEVOLUCION', 'AJUSTE').required(),
  // AJUSTE puede ser 0 (ajustar stock a cero); ENTRADA/SALIDA/DEVOLUCION deben ser > 0
  cantidad:             Joi.when('tipo', {
    is: 'AJUSTE',
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().min(0.01).required(),
  }),
  motivo:               Joi.string().allow('', null).optional(),
  referencia_doc:       Joi.string().allow('', null).optional(),
  // ✅ CORRECCIÓN IMPORTANTE 5: id_tecnico obligatorio para SALIDA
  id_tecnico:           Joi.when('tipo', {
    is: 'SALIDA',
    then: Joi.number().integer().required().messages({
      'any.required': 'El técnico es obligatorio para movimientos de SALIDA',
      'number.base': 'El técnico debe ser un ID válido',
    }),
    otherwise: Joi.number().integer().allow(null).optional(),
  }),
  id_orden_trabajo:     Joi.string().allow('', null).optional(),
  id_movimiento_origen: Joi.number().integer().allow(null).optional(),
  observaciones:        Joi.string().allow('', null).optional(),
});

const actualizar = Joi.object({
  motivo:         Joi.string().allow('', null).optional(),
  referencia_doc: Joi.string().allow('', null).optional(),
  observaciones:  Joi.string().allow('', null).optional(),
}).min(1);

module.exports = { crear, actualizar };
