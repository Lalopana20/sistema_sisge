const PermisoModel = require('../models/permisoModel');
const logger = require('../utils/logger');

/**
 * Verifica permisos efectivos: rol + overrides individuales.
 * Admin siempre tiene acceso total.
 */
const verificarPermiso = (modulo, accion) => {
  return async (req, res, next) => {
    try {
      const usuario = req.usuario;
      if (!usuario) return res.status(401).json({ error: 'No autenticado' });

      // Admin: acceso total sin consultar BD
      if (usuario.rol === 'admin') return next();

      // Verificar permiso efectivo (rol + override individual)
      const tienePermiso = await PermisoModel.tienePermisoEfectivo(
        usuario.id, usuario.rol, modulo, accion,
      );

      if (!tienePermiso) {
        logger.warn('Permiso denegado', {
          usuario: usuario.username,
          modulo,
          accion,
          rol: usuario.rol,
        });
        return res.status(403).json({
          error: 'No tienes permisos para realizar esta acción',
          modulo,
          accion,
          rol: usuario.rol,
        });
      }

      next();
    } catch (error) {
      // Manejar tablas inexistentes (permisos o permisos_usuario sin migración)
      if (error.code === 'ER_NO_SUCH_TABLE') {
        const tabla = error.message?.includes('permisos_usuario') ? 'permisos_usuario' : 'permisos';
        if (tabla === 'permisos_usuario') {
          // permisos_usuario no existe — usar solo permisos del rol como fallback
          logger.warn(`Tabla ${tabla} no existe, usando solo permisos del rol`, {
            usuario: req.usuario?.username, modulo, accion,
          });
          try {
            const tienePermisoRol = await PermisoModel.tienePermiso(req.usuario.rol, modulo, accion);
            if (!tienePermisoRol) {
              return res.status(403).json({
                error: 'No tienes permisos para realizar esta acción',
                modulo, accion, rol: req.usuario.rol,
              });
            }
            return next();
          } catch {
            // Si también falla la tabla permisos, dejar pasar a admins
            if (req.usuario.rol === 'admin') return next();
            return res.status(503).json({ error: 'Sistema en configuración. Ejecuta las migraciones SQL pendientes.' });
          }
        }
        logger.error(`Tabla ${tabla} no existe — ejecuta las migraciones SQL`);
        return res.status(503).json({
          error: 'Sistema en configuración. Ejecuta las migraciones SQL pendientes.',
        });
      }
      next(error);
    }
  };
};

const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
  next();
};

const adminOSupervisor = (req, res, next) => {
  if (!req.usuario || !['admin', 'supervisor'].includes(req.usuario.rol)) {
    return res.status(403).json({
      error: 'Acceso denegado. Requiere rol de administrador o supervisor.',
    });
  }
  next();
};

module.exports = { verificarPermiso, soloAdmin, adminOSupervisor };
