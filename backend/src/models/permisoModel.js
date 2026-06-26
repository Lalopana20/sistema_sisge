const db = require('../config/db');
const logger = require('../utils/logger');

const PermisoModel = {

  // ── Permisos de ROL ───────────────────────────────────────────────────────

  async obtenerPermiso(rol, modulo) {
    const [rows] = await db.query(
      'SELECT * FROM permisos WHERE rol = ? AND modulo = ?',
      [rol, modulo],
    );
    return rows[0] || null;
  },

  async obtenerPermisosPorRol(rol) {
    const [rows] = await db.query(
      'SELECT * FROM permisos WHERE rol = ? ORDER BY modulo',
      [rol],
    );
    return rows;
  },

  async tienePermiso(rol, modulo, accion) {
    const permiso = await this.obtenerPermiso(rol, modulo);
    if (!permiso) return false;
    const mapa = { ver: 'puede_ver', crear: 'puede_crear', editar: 'puede_editar', eliminar: 'puede_eliminar' };
    return !!permiso[mapa[accion]];
  },

  async actualizarPermiso(rol, modulo, { puede_ver, puede_crear, puede_editar, puede_eliminar }) {
    const [result] = await db.query(
      `INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         puede_ver      = VALUES(puede_ver),
         puede_crear    = VALUES(puede_crear),
         puede_editar   = VALUES(puede_editar),
         puede_eliminar = VALUES(puede_eliminar)`,
      [rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar],
    );
    return result.affectedRows;
  },

  async obtenerModulosVisibles(rol) {
    const [rows] = await db.query(
      'SELECT modulo FROM permisos WHERE rol = ? AND puede_ver = TRUE ORDER BY modulo',
      [rol],
    );
    return rows.map(r => r.modulo);
  },

  // ── Permisos INDIVIDUALES por usuario ─────────────────────────────────────

  /**
   * Obtiene los overrides de permisos de un usuario específico.
   */
  async obtenerPermisosUsuario(id_usuario) {
    const [rows] = await db.query(
      `SELECT pu.*, u.nombre AS asignado_por_nombre
       FROM permisos_usuario pu
       LEFT JOIN usuarios u ON pu.asignado_por = u.id
       WHERE pu.id_usuario = ?
       ORDER BY pu.modulo`,
      [id_usuario],
    );
    return rows;
  },

  /**
   * Guarda o actualiza el override de un módulo para un usuario.
   * Valores permitidos:
   *   - undefined/null → guardar como NULL (heredar del rol)
   *   - true/false     → guardar explícitamente
   */
  async guardarPermisoUsuario(id_usuario, modulo, { puede_ver, puede_crear, puede_editar, puede_eliminar }, asignado_por, motivo) {
    const toDb = (val) => {
      if (val === undefined || val === null) return null;
      return !!val;
    };
    const [result] = await db.query(
      `INSERT INTO permisos_usuario
         (id_usuario, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar, asignado_por, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         puede_ver      = VALUES(puede_ver),
         puede_crear    = VALUES(puede_crear),
         puede_editar   = VALUES(puede_editar),
         puede_eliminar = VALUES(puede_eliminar),
         asignado_por   = VALUES(asignado_por),
         motivo         = VALUES(motivo),
         updated_at     = NOW()`,
      [id_usuario, modulo,
       toDb(puede_ver), toDb(puede_crear), toDb(puede_editar), toDb(puede_eliminar),
       asignado_por || null, motivo || null],
    );
    return result.affectedRows;
  },

  /**
   * Elimina el override de un módulo para un usuario
   * (vuelve a usar solo los permisos del rol).
   */
  async eliminarPermisoUsuario(id_usuario, modulo) {
    const [result] = await db.query(
      'DELETE FROM permisos_usuario WHERE id_usuario = ? AND modulo = ?',
      [id_usuario, modulo],
    );
    return result.affectedRows;
  },

  /**
   * Elimina TODOS los overrides de un usuario.
   */
  async resetearPermisosUsuario(id_usuario) {
    const [result] = await db.query(
      'DELETE FROM permisos_usuario WHERE id_usuario = ?',
      [id_usuario],
    );
    return result.affectedRows;
  },

  // ── Fusión: rol + overrides individuales ──────────────────────────────────

  /**
   * Calcula los permisos efectivos de un usuario:
   * combina los permisos del rol con los overrides individuales.
   *
   * Regla de fusión:
   *   - Si existe override para el módulo → usa el override (reemplaza al rol)
   *   - Si no existe override → usa el permiso del rol
   *
   * Esto permite tanto ampliar como restringir permisos del rol.
   */
  async obtenerPermisosEfectivos(id_usuario, rol) {
    // 1. Permisos base del rol
    const permisosRol = await this.obtenerPermisosPorRol(rol);
    const mapaRol = {};
    permisosRol.forEach(p => { mapaRol[p.modulo] = p; });

    // 2. Overrides individuales
    let overrides = [];
    try {
      overrides = await this.obtenerPermisosUsuario(id_usuario);
    } catch (err) {
      logger.warn('Error fetching user permission overrides, falling back to role permissions', { userId: id_usuario, error: err.message, code: err.code });
    }
    const mapaOverride = {};
    overrides.forEach(o => { mapaOverride[o.modulo] = o; });

    // 3. Fusionar: todos los módulos del rol + módulos con override
    const todosModulos = new Set([
      ...Object.keys(mapaRol),
      ...Object.keys(mapaOverride),
    ]);

    const permisosEfectivos = [];
    for (const modulo of todosModulos) {
      const base     = mapaRol[modulo];
      const override = mapaOverride[modulo];

      if (override) {
        // Merge: override reemplaza solo los campos NO NULL;
        // los campos NULL heredan del rol
        permisosEfectivos.push({
          modulo,
          puede_ver:      override.puede_ver !== null ? override.puede_ver : (base?.puede_ver ?? false),
          puede_crear:    override.puede_crear !== null ? override.puede_crear : (base?.puede_crear ?? false),
          puede_editar:   override.puede_editar !== null ? override.puede_editar : (base?.puede_editar ?? false),
          puede_eliminar: override.puede_eliminar !== null ? override.puede_eliminar : (base?.puede_eliminar ?? false),
          fuente:         'usuario',  // indica que viene de override
        });
      } else if (base) {
        permisosEfectivos.push({
          modulo,
          puede_ver:      base.puede_ver,
          puede_crear:    base.puede_crear,
          puede_editar:   base.puede_editar,
          puede_eliminar: base.puede_eliminar,
          fuente:         'rol',
        });
      }
    }

    return permisosEfectivos.sort((a, b) => a.modulo.localeCompare(b.modulo));
  },

  /**
   * Verifica si un usuario tiene un permiso efectivo (rol + override).
   * Usado por el middleware de permisos.
   */
  async tienePermisoEfectivo(id_usuario, rol, modulo, accion) {
    const mapa = { ver: 'puede_ver', crear: 'puede_crear', editar: 'puede_editar', eliminar: 'puede_eliminar' };
    const campo = mapa[accion];
    if (!campo) return false;

    // Buscar override individual primero
    let override = null;
    try {
      const [rows] = await db.query(
        'SELECT * FROM permisos_usuario WHERE id_usuario = ? AND modulo = ? LIMIT 1',
        [id_usuario, modulo],
      );
      override = rows[0] || null;
    } catch (err) {
      logger.warn('Error fetching user permission override for middleware, falling back to role', { userId: id_usuario, modulo, error: err.message, code: err.code });
    }

    if (override) {
      if (override[campo] !== null) return !!override[campo];
      // Campo NULL en override → usar permiso del rol
    }

    return this.tienePermiso(rol, modulo, accion);
  },
};

module.exports = PermisoModel;
