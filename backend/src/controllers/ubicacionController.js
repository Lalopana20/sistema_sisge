const UbicacionService = require('../services/ubicacionService');
const audit            = require('../helpers/auditoriaHelper');

const UbicacionController = {

  async listar(req, res, next) {
    try {
      const data = await UbicacionService.listar(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async alertas(req, res, next) {
    try {
      const data = await UbicacionService.alertas(req.query.dias);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async conteoAlertas(req, res, next) {
    try {
      const total = await UbicacionService.conteoAlertas(req.query.dias);
      res.json({ success: true, data: { total } });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const data = await UbicacionService.obtener(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const data = await UbicacionService.crear(req.body, req.usuario.id);
      await audit.registrar(req, {
        accion:         'CREAR',
        modulo:         'ubicaciones',
        entidad_id:     data.id,
        entidad_nombre: `${data.producto} — ${data.tecnico}`,
        detalle:        { ubicacion: data.ubicacion, motivo: data.motivo, estado: data.estado },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const data = await UbicacionService.actualizar(
        req.params.id, req.body, req.usuario.id, req.usuario.rol,
      );
      await audit.registrar(req, {
        accion:         'EDITAR',
        modulo:         'ubicaciones',
        entidad_id:     data.id,
        entidad_nombre: `${data.producto} — ${data.tecnico}`,
        detalle:        req.body,
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const antes = await UbicacionService.obtener(req.params.id);
      const data  = await UbicacionService.eliminar(req.params.id);
      await audit.registrar(req, {
        accion: 'ELIMINAR',
        modulo: 'ubicaciones',
        entidad_id: Number(req.params.id),
        entidad_nombre: `${antes.producto} — ${antes.tecnico}`,
        detalle: { antes },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async cerrar(req, res, next) {
    try {
      const { nota_cierre } = req.body;
      const data = await UbicacionService.cerrar(
        req.params.id, nota_cierre, req.usuario.id, req.usuario.rol,
      );
      await audit.registrar(req, {
        accion:         'CERRAR_UBICACION',
        modulo:         'ubicaciones',
        entidad_id:     data.id,
        entidad_nombre: `${data.producto} — ${data.tecnico}`,
        detalle:        { nota_cierre, cerrado_por: req.usuario.nombre },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = UbicacionController;
