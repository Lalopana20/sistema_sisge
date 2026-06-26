const AuthService = require('../services/authService');
const PermisoModel = require('../models/permisoModel');
const audit       = require('../helpers/auditoriaHelper');
const logger      = require('../utils/logger');

const AuthController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const resultado = await AuthService.login(username, password);

      res.cookie('sisge_token', resultado.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000,
      });

      await audit.registrar(req, {
        accion: 'LOGIN',
        modulo: 'auth',
        entidad_nombre: resultado.usuario.username,
        usuario: resultado.usuario,
        detalle: { username: resultado.usuario.username, rol: resultado.usuario.rol },
      });

      res.json({
        success: true,
        data: {
          token: resultado.token,
          usuario: resultado.usuario,
          permisos: resultado.permisos,
          modulos_visibles: resultado.modulos_visibles,
        },
      });
    } catch (err) {
      try {
        await audit.registrar(req, {
          accion: 'LOGIN_FALLIDO',
          modulo: 'auth',
          entidad_nombre: req.body?.username || 'desconocido',
          usuario: { nombre: 'Intento fallido', username: req.body?.username, rol: null },
          detalle: { username: req.body?.username, motivo: err.message },
        });
      } catch (auditErr) {
        logger.error('Error registrando LOGIN_FALLIDO en auditoría', { error: auditErr.message });
      }
      next(err);
    }
  },

  async registrar(req, res, next) {
    try {
      const id = await AuthService.registrar(req.body);
      await audit.registrar(req, {
        accion: 'CREAR',
        modulo: 'usuarios',
        entidad_id: id,
        entidad_nombre: req.body.username,
        detalle: { despues: { nombre: req.body.nombre, username: req.body.username, rol: req.body.rol } },
      });
      res.status(201).json({ success: true, data: { mensaje: 'Usuario creado', id } });
    } catch (err) { next(err); }
  },

  async me(req, res, next) {
    try {
      const usuario = await AuthService.obtenerPerfil(req.usuario.id);
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
            fuente:   p.fuente,
          };
        });
        modulos_visibles = permisos.filter(p => p.puede_ver).map(p => p.modulo);
      } catch (permErr) {
        logger.error('Error fetching permissions in /me', { userId: usuario.id, error: permErr.message, code: permErr.code });
        if (usuario.rol === 'admin') {
          const modulos = ['dashboard','productos','categorias','subcategorias','movimientos',
                           'historial','ubicaciones','reportes','usuarios','auditoria','importar'];
          modulos.forEach(m => { permisosMap[m] = { ver: true, crear: true, editar: true, eliminar: true, fuente: 'rol' }; });
          modulos_visibles = modulos;
        } else {
          return res.status(500).json({ error: 'Error al cargar permisos. Contacta al administrador.' });
        }
      }
      res.json({ success: true, data: { usuario, permisos: permisosMap, modulos_visibles } });
    } catch (err) { next(err); }
  },

  async cambiarPassword(req, res, next) {
    try {
      const { password_actual, password_nueva } = req.body;
      const token = req.headers['authorization']?.replace('Bearer ', '') || req.cookies?.sisge_token;
      const data = await AuthService.cambiarPassword(
        req.usuario.id, password_actual, password_nueva, token,
      );
      await audit.registrar(req, {
        accion: 'CAMBIAR_PASSWORD',
        modulo: 'auth',
        entidad_id: req.usuario.id,
        entidad_nombre: req.usuario.username || req.usuario.email,
        detalle: { mensaje: 'Contraseña actualizada' },
      });
      res.clearCookie('sisge_token', { path: '/' });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async logout(req, res, next) {
    try {
      // req.usuario ya fue verificado y decodificado por authMiddleware (jwt.verify)
      // El token viene garantizado por el middleware — no se usa jwt.decode sin verificar
      const tokenCookie = req.cookies?.sisge_token;
      const tokenHeader = req.headers['authorization']?.replace('Bearer ', '');
      const token = tokenCookie || tokenHeader;

      if (token) {
        // id_usuario disponible desde req.usuario (ya verificado por authMiddleware)
        await AuthService.invalidarToken(token, req.usuario.id);
      }

      res.clearCookie('sisge_token', { path: '/' });
      res.json({ success: true, mensaje: 'Sesión cerrada correctamente' });
    } catch (err) {
      // Aunque falle la invalidación, limpiar la cookie
      res.clearCookie('sisge_token', { path: '/' });
      res.json({ success: true, mensaje: 'Sesión cerrada' });
    }
  },
};

module.exports = AuthController;
