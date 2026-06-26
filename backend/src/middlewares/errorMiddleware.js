const logger = require('../utils/logger');

const MENSAJES_FK = {
  ER_ROW_IS_REFERENCED_2: 'No se puede eliminar: tiene registros asociados',
  ER_ROW_IS_REFERENCED:   'No se puede eliminar: tiene registros asociados',
};

const errorMiddleware = (err, req, res, _next) => {
  if (err.code && MENSAJES_FK[err.code]) {
    logger.warn(`[409] FK violation ${req.method} ${req.path}`, { error: err.message });
    return res.status(409).json({ success: false, error: MENSAJES_FK[err.code] });
  }
  if (err.errno === 1451) {
    return res.status(409).json({ success: false, error: MENSAJES_FK.ER_ROW_IS_REFERENCED_2 });
  }

  const status  = err.status  || err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  if (status >= 500) {
    logger.error(`[${status}] ${req.method} ${req.path}`, { error: err.message, stack: err.stack });
  } else {
    logger.warn(`[${status}] ${req.method} ${req.path}`, { error: err.message });
  }

  res.status(status).json({ success: false, error: mensaje });
};

module.exports = errorMiddleware;
