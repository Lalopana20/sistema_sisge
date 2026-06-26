const rateLimit = require('express-rate-limit');

// Configuración para respetar X-Forwarded-For detrás de proxy (XAMPP)
const proxyConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  // Usar X-Forwarded-For si está disponible (detrás de proxy)
  validate: { xForwardedForHeader: false },
};

/**
 * Rate limiter para login - previene ataques de fuerza bruta
 * Combina IP + username para evitar que un atacante con rotación
 * de IP o múltiples usuarios compartiendo NAT agoten el límite global.
 * Permite 8 intentos cada 15 minutos por (IP + username).
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: {
    error: 'Demasiados intentos de login. Por favor, intenta de nuevo en 15 minutos.',
  },
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const username = req.body?.username || 'anonymous';
    return `${ip}:${username.toLowerCase()}`;
  },
  ...proxyConfig,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de login',
      mensaje: 'Has excedido el límite de intentos. Por favor, espera 15 minutos antes de intentar nuevamente.',
      reintentar_en: '15 minutos',
    });
  },
});

/**
 * Rate limiter general para API
 * Permite 500 peticiones cada 15 minutos por IP.
 * El dashboard hace ~4 peticiones al cargar + auto-refresh cada 2 min,
 * más las peticiones normales de navegación. 100 era demasiado bajo.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    error: 'Demasiadas peticiones. Por favor, intenta más tarde.',
  },
  ...proxyConfig,
});

/**
 * Rate limiter estricto para operaciones sensibles
 * Permite 10 peticiones cada hora
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Límite de operaciones sensibles excedido. Intenta en 1 hora.',
  },
  ...proxyConfig,
});

module.exports = {
  loginLimiter,
  apiLimiter,
  strictLimiter,
};
