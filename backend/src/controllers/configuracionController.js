const ConfiguracionService = require('../services/configuracionService');
const audit                = require('../helpers/auditoriaHelper');

const ConfiguracionController = {
  async listar(req, res, next) {
    try {
      const data = await ConfiguracionService.listar();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const data = await ConfiguracionService.obtener(req.params.clave);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const data = await ConfiguracionService.crear(req.body);
      await audit.registrar(req, {
        accion: 'CREAR',
        modulo: 'configuracion',
        entidad_id: data.id,
        entidad_nombre: data.clave,
        detalle: { despues: { clave: data.clave, valor: data.valor } },
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const antes = await ConfiguracionService.obtenerPorId(req.params.id);
      const data  = await ConfiguracionService.actualizar(req.params.id, req.body);
      await audit.registrar(req, {
        accion: 'EDITAR',
        modulo: 'configuracion',
        entidad_id: antes.id,
        entidad_nombre: antes.clave,
        detalle: { antes: antes, despues: data },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const antes = await ConfiguracionService.obtenerPorId(req.params.id);
      const data  = await ConfiguracionService.eliminar(req.params.id);
      await audit.registrar(req, {
        accion: 'ELIMINAR',
        modulo: 'configuracion',
        entidad_id: antes.id,
        entidad_nombre: antes.clave,
        detalle: { antes },
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = ConfiguracionController;
