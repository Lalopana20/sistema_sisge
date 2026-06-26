const PermisoModel = require('../models/permisoModel');
const UsuarioModel = require('../models/usuarioModel');
const audit        = require('../helpers/auditoriaHelper');

const MODULOS_SISTEMA = [
  'dashboard', 'productos', 'categorias', 'subcategorias',
  'movimientos', 'historial', 'ubicaciones', 'reportes',
  'usuarios', 'auditoria', 'importar',
];

const PermisoController = {

  // GET /api/permisos/modulos
  async listarModulos(req, res, next) {
    try {
      res.json({ success: true, data: MODULOS_SISTEMA });
    } catch (err) { next(err); }
  },

  // GET /api/permisos/mis-permisos
  async obtenerMisPermisos(req, res, next) {
    try {
      const { id, rol } = req.usuario;
      const permisos = await PermisoModel.obtenerPermisosEfectivos(id, rol);
      const permisosMap = {};
      permisos.forEach(p => {
        permisosMap[p.modulo] = {
          ver: p.puede_ver, crear: p.puede_crear,
          editar: p.puede_editar, eliminar: p.puede_eliminar,
          fuente: p.fuente,
        };
      });
      res.json({ success: true, data: {
        rol,
        permisos: permisosMap,
        modulos_visibles: permisos.filter(p => p.puede_ver).map(p => p.modulo),
      }});
    } catch (err) { next(err); }
  },

  // GET /api/permisos — permisos de todos los roles (para panel de admin)
  async listarTodos(req, res, next) {
    try {
      const roles = ['admin', 'supervisor', 'operario'];
      const resultado = {};
      for (const rol of roles) {
        resultado[rol] = await PermisoModel.obtenerPermisosPorRol(rol);
      }
      res.json({ success: true, data: resultado });
    } catch (err) { next(err); }
  },

  // PUT /api/permisos — actualizar permiso de un ROL
  async actualizar(req, res, next) {
    try {
      const { rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar } = req.body;
      await PermisoModel.actualizarPermiso(rol, modulo, {
        puede_ver:      !!puede_ver,
        puede_crear:    !!puede_crear,
        puede_editar:   !!puede_editar,
        puede_eliminar: !!puede_eliminar,
      });
      await audit.registrar(req, {
        accion: 'EDITAR', modulo: 'permisos',
        entidad_nombre: `rol:${rol} módulo:${modulo}`,
        detalle: { rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar },
      });
      res.json({ success: true, mensaje: 'Permisos del rol actualizados' });
    } catch (err) { next(err); }
  },

  // GET /api/permisos/usuario/:id — permisos efectivos + overrides de un usuario
  async obtenerPermisosUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.findById(id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      const [permisosRol, overrides, efectivos] = await Promise.all([
        PermisoModel.obtenerPermisosPorRol(usuario.rol),
        PermisoModel.obtenerPermisosUsuario(id),
        PermisoModel.obtenerPermisosEfectivos(id, usuario.rol),
      ]);

      // Construir vista completa: todos los módulos con estado base + override + efectivo
      const mapaRol      = {};
      const mapaOverride = {};
      permisosRol.forEach(p => { mapaRol[p.modulo] = p; });
      overrides.forEach(o => { mapaOverride[o.modulo] = o; });

      const vista = MODULOS_SISTEMA.map(modulo => ({
        modulo,
        rol_base: mapaRol[modulo] || { puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false },
        override: mapaOverride[modulo] || null,
        efectivo: efectivos.find(e => e.modulo === modulo) || { puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false },
      }));

      res.json({ success: true, data: { usuario, vista, overrides } });
    } catch (err) { next(err); }
  },

  // PUT /api/permisos/usuario/:id — guardar override de un módulo para un usuario
  async guardarPermisoUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const { modulo, puede_ver, puede_crear, puede_editar, puede_eliminar, motivo } = req.body;

      const usuario = await UsuarioModel.findById(id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      // No se pueden asignar permisos a admins (tienen acceso total)
      if (usuario.rol === 'admin') {
        return res.status(400).json({ error: 'Los administradores tienen acceso total. No se pueden restringir.' });
      }

      await PermisoModel.guardarPermisoUsuario(
        id, modulo,
        { puede_ver, puede_crear, puede_editar, puede_eliminar },
        req.usuario.id,
        motivo,
      );

      await audit.registrar(req, {
        accion: 'EDITAR', modulo: 'permisos',
        entidad_id: Number(id),
        entidad_nombre: `usuario:${usuario.username} módulo:${modulo}`,
        detalle: { modulo, puede_ver, puede_crear, puede_editar, puede_eliminar, motivo },
      });

      res.json({ success: true, mensaje: `Permisos de ${usuario.nombre} actualizados para módulo "${modulo}"` });
    } catch (err) { next(err); }
  },

  // DELETE /api/permisos/usuario/:id/modulo/:modulo — eliminar override (vuelve al rol)
  async eliminarPermisoUsuario(req, res, next) {
    try {
      const { id, modulo } = req.params;
      const usuario = await UsuarioModel.findById(id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      await PermisoModel.eliminarPermisoUsuario(id, modulo);

      await audit.registrar(req, {
        accion: 'ELIMINAR', modulo: 'permisos',
        entidad_id: Number(id),
        entidad_nombre: `usuario:${usuario.username} módulo:${modulo}`,
        detalle: { accion: 'reset_override', modulo },
      });

      res.json({ success: true, mensaje: `Override eliminado. ${usuario.nombre} usará los permisos del rol "${usuario.rol}"` });
    } catch (err) { next(err); }
  },

  // DELETE /api/permisos/usuario/:id/reset — eliminar TODOS los overrides
  async resetearPermisosUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.findById(id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      await PermisoModel.resetearPermisosUsuario(id);

      await audit.registrar(req, {
        accion: 'EDITAR', modulo: 'permisos',
        entidad_id: Number(id),
        entidad_nombre: `usuario:${usuario.username}`,
        detalle: { accion: 'reset_todos_overrides' },
      });

      res.json({ success: true, mensaje: `Todos los permisos personalizados de ${usuario.nombre} fueron eliminados` });
    } catch (err) { next(err); }
  },
};

module.exports = PermisoController;
