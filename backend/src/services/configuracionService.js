const ConfiguracionModel = require('../models/configuracionModel');

const httpError = (status, message) => {
  const err = new Error(message); err.status = status; return err;
};

const ConfiguracionService = {
  async listar() {
    return ConfiguracionModel.listar();
  },

  async obtener(clave) {
    const config = await ConfiguracionModel.obtener(clave);
    if (!config) throw httpError(404, 'Configuración no encontrada');
    return config;
  },

  async obtenerPorId(id) {
    const config = await ConfiguracionModel.obtenerPorId(id);
    if (!config) throw httpError(404, 'Configuración no encontrada');
    return config;
  },

  async crear({ clave, valor, descripcion }) {
    const existe = await ConfiguracionModel.obtener(clave);
    if (existe) throw httpError(409, `La configuración '${clave}' ya existe`);
    const id = await ConfiguracionModel.crear({ clave, valor, descripcion });
    return ConfiguracionModel.obtenerPorId(id);
  },

  async actualizar(id, datos) {
    const config = await ConfiguracionModel.obtenerPorId(id);
    if (!config) throw httpError(404, 'Configuración no encontrada');
    await ConfiguracionModel.actualizar(id, datos);
    return ConfiguracionModel.obtenerPorId(id);
  },

  async eliminar(id) {
    const config = await ConfiguracionModel.obtenerPorId(id);
    if (!config) throw httpError(404, 'Configuración no encontrada');
    await ConfiguracionModel.eliminar(id);
    return { mensaje: 'Configuración eliminada correctamente' };
  },
};

module.exports = ConfiguracionService;
