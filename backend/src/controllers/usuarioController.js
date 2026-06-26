const UsuarioService = require('../services/usuarioService');
const audit          = require('../helpers/auditoriaHelper');

const UsuarioController = {
  async listar(req, res, next) {
    try {
      const data = await UsuarioService.listar(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const data = await UsuarioService.obtener(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const data = await UsuarioService.crear(req.body);
      await audit.registrar(req, {
        accion: 'CREAR',
        modulo: 'usuarios',
        entidad_id: data.id,
        entidad_nombre: data.username,
        detalle: { despues: { nombre: data.nombre, username: data.username, email: data.email, rol: data.rol } },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const antes = await UsuarioService.obtener(req.params.id);
      const data  = await UsuarioService.actualizar(req.params.id, req.body, req.usuario.id);
      await audit.registrar(req, {
        accion: 'EDITAR',
        modulo: 'usuarios',
        entidad_id: data.id,
        entidad_nombre: data.username,
        detalle: { antes, despues: data },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async cambiarEstado(req, res, next) {
    try {
      const data  = await UsuarioService.toggleEstado(req.params.id, req.body.activo);
      await audit.registrar(req, {
        accion: req.body.activo ? 'ACTIVAR' : 'DESACTIVAR',
        modulo: 'usuarios',
        entidad_id: data.id,
        entidad_nombre: data.username,
        detalle: { activo: req.body.activo },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async listarOperarios(req, res, next) {
    try {
      const data = await UsuarioService.listarOperarios();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const antes = await UsuarioService.obtener(req.params.id);
      const data  = await UsuarioService.eliminar(req.params.id, req.usuario.id);
      await audit.registrar(req, {
        accion: 'ELIMINAR',
        modulo: 'usuarios',
        entidad_id: antes.id,
        entidad_nombre: antes.username,
        detalle: { antes },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = UsuarioController;
