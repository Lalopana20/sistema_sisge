const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const db     = require('../config/db');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    token = req.cookies?.sisge_token;
  }

  if (!token) {
    logger.warn('Auth: token no proporcionado', { path: req.path, method: req.method });
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar si el token fue invalidado (logout)
    // Si la tabla sesiones_invalidas no existe aún, se omite la verificación
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const [rows] = await db.query(
        'SELECT id FROM sesiones_invalidas WHERE token_hash = ? AND fecha_exp > NOW() LIMIT 1',
        [tokenHash],
      );
      if (rows.length > 0) {
        logger.warn('Auth: token invalidado', { path: req.path });
        return res.status(401).json({ error: 'Token invalidado' });
      }
    } catch (dbErr) {
      // Si la tabla no existe todavía, continuar sin verificar invalidación
      if (dbErr.code !== 'ER_NO_SUCH_TABLE') {
        logger.error('Auth: error al verificar sesiones_invalidas', { error: dbErr.message });
      }
    }

    req.usuario = decoded;
    next();
  } catch {
    logger.warn('Auth: token inválido/expirado', { path: req.path });
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
