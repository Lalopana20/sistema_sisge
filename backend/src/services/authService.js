const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const db           = require('../config/db');
const UsuarioModel = require('../models/usuarioModel');
const PermisoModel = require('../models/permisoModel');
const logSecurity  = require('../utils/securityLogger');
const logger       = require('../utils/logger');

// Helper para crear errores con status HTTP
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const AuthService = {
  async login(username, password) {
    // Normalizar username a minúsculas para login case-insensitive
    const usernameLower = username.toLowerCase();
    const usuario = await UsuarioModel.findByUsername(usernameLower);

    if (!usuario) {
      logSecurity('LOGIN_FAILED', {
        username: usernameLower,
        reason: 'USER_NOT_FOUND',
      });
      throw httpError(401, 'Credenciales incorrectas');
    }

    const valido = await bcrypt.compare(password, usuario.password_hash);

    if (!valido) {
      logSecurity('LOGIN_FAILED', {
        username: usernameLower,
        userId: usuario.id,
        reason: 'INVALID_PASSWORD',
      });
      throw httpError(401, 'Credenciales incorrectas');
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, username: usuario.username, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );

    // Obtener permisos efectivos del usuario (rol + overrides individuales)
    let permisosMap = {};
    let modulos_visibles = [];
    try {
      const permisos = await PermisoModel.obtenerPermisosEfectivos(usuario.id, usuario.rol);
      permisos.forEach(p => {
        permisosMap[p.modulo] = {
          ver:      p.puede_ver,
          crear:    p.puede_crear,
          editar:   p.puede_editar,
          eliminar: p.puede_eliminar,
          fuente:   p.fuente,   // 'rol' | 'usuario'
        };
      });
      modulos_visibles = permisos.filter(p => p.puede_ver).map(p => p.modulo);
    } catch (permErr) {
      logger.error('Error fetching permissions during login', { userId: usuario.id, error: permErr.message, code: permErr.code });
      if (usuario.rol === 'admin') {
        const modulos = ['dashboard','productos','categorias','subcategorias','movimientos',
                         'historial','ubicaciones','reportes','usuarios','auditoria','importar'];
        modulos.forEach(m => { permisosMap[m] = { ver: true, crear: true, editar: true, eliminar: true, fuente: 'rol' }; });
        modulos_visibles = modulos;
      } else {
        throw httpError(500, 'Error al cargar permisos. Contacta al administrador.');
      }
    }

    // Log de login exitoso
    logSecurity('LOGIN_SUCCESS', {
      username: usernameLower,
      userId: usuario.id,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
      },
      permisos: permisosMap,
      modulos_visibles,
    };
  },

  async registrar({ nombre, username, email, password, rol }) {
    // Normalizar username a minúsculas
    const usernameLower = username.toLowerCase();

    // Validar nombre duplicado
    const existeNombre = await UsuarioModel.findByNombreRaw(nombre);
    if (existeNombre) {
      throw httpError(409, 'El nombre ya está registrado');
    }

    // ✅ CORRECCIÓN URGENTE 1: Validar username duplicado
    const existeUsername = await UsuarioModel.findByUsernameRaw(usernameLower);
    if (existeUsername) {
      throw httpError(409, 'El nombre de usuario ya está en uso');
    }

    // Validar email duplicado (si se proporciona)
    if (email) {
      const existeEmail = await UsuarioModel.findByEmailRaw(email);
      if (existeEmail) {
        throw httpError(409, 'El correo electrónico ya está registrado');
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = await UsuarioModel.crear({ nombre, username: usernameLower, email: email || null, password_hash, rol });

    logSecurity('USER_CREATED', {
      userId: id,
      username: usernameLower,
      rol,
    });

    return id;
  },

  async obtenerPerfil(id) {
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) throw httpError(401, 'Usuario no encontrado');
    return usuario;
  },

  async cambiarPassword(id, password_actual, password_nueva, token = null) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [usuarioRows] = await conn.query(
        'SELECT id, password_hash FROM usuarios WHERE id = ? AND COALESCE(activo, 1) = 1 FOR UPDATE',
        [id],
      );
      if (!usuarioRows.length) throw httpError(404, 'Usuario no encontrado');

      const valido = await bcrypt.compare(password_actual, usuarioRows[0].password_hash);
      if (!valido) throw httpError(401, 'La contraseña actual es incorrecta');
      if (await bcrypt.compare(password_nueva, usuarioRows[0].password_hash)) {
        throw httpError(400, 'La contraseña nueva debe ser diferente a la actual');
      }

      const password_hash = await bcrypt.hash(password_nueva, 10);

      await conn.query(
        'UPDATE usuarios SET password_hash = ? WHERE id = ?',
        [password_hash, id],
      );

      await conn.commit();

      // Invalidar el token actual (fuerza re-login después del cambio)
      if (token) {
        try {
          await this.invalidarToken(token, id);
        } catch (invalErr) {
          logger.warn('No se pudo invalidar el token tras cambio de password', { userId: id, error: invalErr.message });
        }
      }

      return { mensaje: 'Contraseña actualizada correctamente. Vuelve a iniciar sesión.' };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async invalidarToken(token, id_usuario) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const fechaExp = new Date(decoded.exp * 1000);
    try {
      await db.query(
        'INSERT INTO sesiones_invalidas (token_hash, id_usuario, fecha_exp) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
        [tokenHash, id_usuario || decoded.id, fechaExp],
      );
    } catch (err) {
      // Si la tabla no existe, el logout igual procede (la cookie se limpia en el controlador)
      if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }
  },
};

module.exports = AuthService;
