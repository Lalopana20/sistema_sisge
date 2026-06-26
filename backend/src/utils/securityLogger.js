/**
 * securityLogger — wrapper de logger para eventos de seguridad.
 * Centraliza los logs de seguridad con un prefijo [SECURITY] y nivel 'warn'
 * para que sean fácilmente filtrables en los archivos de log.
 *
 * Uso: logSecurity('LOGIN_FAILED', { username, reason })
 */
const logger = require('./logger');

const logSecurity = (event, details = {}) => {
  // Nivel warn para que aparezca en error.log además de combined.log
  logger.warn(`[SECURITY] ${event}`, { event, ...details });
};

module.exports = logSecurity;
