const AuditoriaModel = require('../models/auditoriaModel');
const logger = require('../utils/logger');

const CAMPOS_SENSIBLES = ['password', 'password_hash', 'password_actual', 'password_nueva', 'confirmar'];

const limpiar = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const copia = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const k of Object.keys(copia)) {
    if (CAMPOS_SENSIBLES.includes(k)) copia[k] = '***';
    else if (typeof copia[k] === 'object') copia[k] = limpiar(copia[k]);
  }
  return copia;
};

const ipCliente = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim()
  || req.socket?.remoteAddress
  || null;

/**
 * Registra un evento de auditoría (no lanza error si falla el log).
 */
const registrar = async (req, {
  accion,
  modulo,
  entidad_id = null,
  entidad_nombre = null,
  detalle = null,
  usuario = null,
}) => {
  try {
    const u = usuario || req?.usuario;
    const payload = {
      id_usuario:     u?.id ?? null,
      usuario_nombre: u?.nombre ?? null,
      usuario_email:  u?.email ?? null,
      usuario_rol:    u?.rol ?? null,
      accion,
      modulo,
      entidad_id,
      entidad_nombre,
      detalle: detalle ? JSON.stringify(limpiar(detalle)) : null,
      ip: ipCliente(req),
      user_agent: (req?.headers?.['user-agent'] || '').slice(0, 255),
    };
    await AuditoriaModel.crear(payload);
  } catch (err) {
    // Si la tabla auditoria no existe aún, no bloquear la operación principal
    if (err.code === 'ER_NO_SUCH_TABLE') {
      logger.warn('Tabla auditoria no existe — ejecuta EJECUTAR_PRIMERO_fix_completo.sql');
    } else {
      logger.error('Auditoría no registrada', { error: err.message });
    }
  }
};

module.exports = { registrar, limpiar };
