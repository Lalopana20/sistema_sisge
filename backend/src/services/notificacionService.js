const NotificacionModel = require('../models/notificacionModel');
const UsuarioModel      = require('../models/usuarioModel');
const logger            = require('../utils/logger');

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// ── TIPOS DE NOTIFICACIÓN ────────────────────────────────────────────────────
const TIPOS = {
  STOCK_BAJO: 'STOCK_BAJO',
  STOCK_RECUPERADO: 'STOCK_RECUPERADO',
  DEVOLUCION_VENCIDA: 'DEVOLUCION_VENCIDA',
  DEVOLUCION_PROXIMA: 'DEVOLUCION_PROXIMA',
  MATERIAL_EXTRAVIADO: 'MATERIAL_EXTRAVIADO',
  INFO: 'INFO',
};

const NotificacionService = {
  TIPOS, // Exportar tipos para uso externo

  async listar(id_usuario, filtros) {
    return NotificacionModel.listar(id_usuario, filtros);
  },

  async noLeidas(id_usuario) {
    return NotificacionModel.noLeidas(id_usuario);
  },

  async crear(datos) {
    const id = await NotificacionModel.crear(datos);
    return { id, ...datos };
  },

  async marcarLeida(id, id_usuario) {
    const afectadas = await NotificacionModel.marcarLeida(id, id_usuario);
    if (!afectadas) throw httpError(404, 'Notificación no encontrada');
    return { mensaje: 'Notificación marcada como leida' };
  },

  async marcarTodasLeidas(id_usuario) {
    const afectadas = await NotificacionModel.marcarTodasLeidas(id_usuario);
    return { mensaje: `Se marcaron ${afectadas} notificación(es) como leidas` };
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MÉTODOS AUTOMÁTICOS PARA NOTIFICACIONES PROACTIVAS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Obtener destinatarios por rol
   * @param {string|string[]} roles - Rol(es) a buscar ('admin', 'supervisor', etc)
   * @returns {Promise<Array>} Lista de usuarios activos con ese rol
   */
  async obtenerDestinatarios(roles) {
    try {
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      const destinatarios = [];

      for (const rol of rolesArray) {
        const usuarios = await UsuarioModel.listar({ rol });
        const usuariosArray = Array.isArray(usuarios) ? usuarios : usuarios.data || [];
        destinatarios.push(...usuariosArray);
      }

      return destinatarios;
    } catch (error) {
      logger.error('Error al obtener destinatarios:', error);
      return [];
    }
  },

  /**
   * Notificar stock bajo de un producto
   * @param {Object} producto - Producto con stock bajo
   */
  async notificarStockBajo(producto) {
    try {
      // Solo notificar a administradores y supervisores
      const destinatarios = await this.obtenerDestinatarios(['admin', 'supervisor']);

      if (destinatarios.length === 0) {
        logger.warn('No hay administradores o supervisores para notificar stock bajo');
        return;
      }

      const titulo = `📦 Stock bajo: ${producto.nombre}`;
      const mensaje = `El producto "${producto.nombre}" tiene stock bajo.\n` +
                     `Stock actual: ${producto.stock_actual} ${producto.unidad_medida}\n` +
                     `Stock mínimo: ${producto.stock_minimo} ${producto.unidad_medida}`;
      const url = `/productos/${producto.id}`;

      // Crear notificación para cada destinatario
      for (const usuario of destinatarios) {
        await NotificacionModel.crear({
          id_usuario: usuario.id,
          tipo: TIPOS.STOCK_BAJO,
          titulo,
          mensaje,
          url,
        });
      }

      logger.info(`Stock bajo notificado para producto ${producto.id} (${producto.nombre}) a ${destinatarios.length} usuario(s)`);
    } catch (error) {
      logger.error('Error al notificar stock bajo:', error);
    }
  },

  /**
   * Notificar devolución vencida
   * @param {Object} ubicacion - Ubicación con devolución vencida
   * @param {string} tipoDestinatario - 'tecnico' o 'supervisor'
   */
  async notificarDevolucionVencida(ubicacion, tipoDestinatario = 'tecnico') {
    try {
      let destinatarios = [];

      if (tipoDestinatario === 'tecnico') {
        // Notificar solo al técnico responsable
        const tecnico = await UsuarioModel.findById(ubicacion.id_tecnico);
        if (tecnico) {
          destinatarios = [tecnico];
        }
      } else if (tipoDestinatario === 'supervisor') {
        // Notificar a supervisores y admins
        destinatarios = await this.obtenerDestinatarios(['admin', 'supervisor']);
      }

      if (destinatarios.length === 0) {
        logger.warn(`No hay destinatarios (${tipoDestinatario}) para notificar devolución vencida`);
        return;
      }

      const diasVencido = ubicacion.dias_fuera || 0;

      let titulo, mensaje, url;

      if (tipoDestinatario === 'tecnico') {
        titulo = '⏰ Devolución vencida - Acción requerida';
        mensaje = `Tienes material pendiente de devolución:\n` +
                 `Material: ${ubicacion.producto}\n` +
                 `Días sin devolver: ${diasVencido} días\n` +
                 `Por favor, devuelve el material lo antes posible.`;
        url = `/ubicaciones/${ubicacion.id}`;
      } else {
        titulo = `⚠️ ${ubicacion.tecnico} tiene material vencido`;
        mensaje = `El técnico ${ubicacion.tecnico} tiene material sin devolver:\n` +
                 `Material: ${ubicacion.producto}\n` +
                 `Cantidad: ${ubicacion.movimiento_cantidad} ${ubicacion.producto.includes('unidad') ? 'unidades' : ''}\n` +
                 `Días vencido: ${diasVencido} días`;
        url = `/ubicaciones?tecnico=${ubicacion.id_tecnico}`;
      }

      // Crear notificación para cada destinatario
      for (const usuario of destinatarios) {
        await NotificacionModel.crear({
          id_usuario: usuario.id,
          tipo: TIPOS.DEVOLUCION_VENCIDA,
          titulo,
          mensaje,
          url,
        });
      }

      logger.info(`Devolución vencida notificada (${tipoDestinatario}) para ubicación ${ubicacion.id} a ${destinatarios.length} usuario(s)`);
    } catch (error) {
      logger.error('Error al notificar devolución vencida:', error);
    }
  },

  /**
   * Notificar material extraviado
   * @param {Object} ubicacion - Ubicación marcada como extraviada
   * @param {number} cantidad - Cantidad extraviada
   */
  async notificarMaterialExtraviado(ubicacion, cantidad) {
    try {
      // Solo notificar a administradores
      const destinatarios = await this.obtenerDestinatarios('admin');

      if (destinatarios.length === 0) {
        logger.warn('No hay administradores para notificar material extraviado');
        return;
      }

      const titulo = '🚨 Material extraviado reportado';
      const mensaje = `Se ha reportado material extraviado:\n` +
                     `Material: ${ubicacion.producto}\n` +
                     `Cantidad: ${cantidad}\n` +
                     `Técnico responsable: ${ubicacion.tecnico}\n` +
                     `Ubicación registrada: ${ubicacion.ubicacion}`;
      const url = `/ubicaciones/${ubicacion.id}`;

      // Crear notificación para cada administrador
      for (const usuario of destinatarios) {
        await NotificacionModel.crear({
          id_usuario: usuario.id,
          tipo: TIPOS.MATERIAL_EXTRAVIADO,
          titulo,
          mensaje,
          url,
        });
      }

      logger.info(`Material extraviado notificado para ubicación ${ubicacion.id} a ${destinatarios.length} administrador(es)`);
    } catch (error) {
      logger.error('Error al notificar material extraviado:', error);
    }
  },

  /**
   * Notificar cuando el stock se recupera (opcional)
   * @param {Object} producto - Producto cuyo stock se recuperó
   */
  async notificarStockRecuperado(producto) {
    try {
      const destinatarios = await this.obtenerDestinatarios(['admin', 'supervisor']);

      if (destinatarios.length === 0) return;

      const titulo = `✅ Stock recuperado: ${producto.nombre}`;
      const mensaje = `El producto "${producto.nombre}" ha recuperado su stock mínimo.\n` +
                     `Stock actual: ${producto.stock_actual} ${producto.unidad_medida}`;
      const url = `/productos/${producto.id}`;

      for (const usuario of destinatarios) {
        await NotificacionModel.crear({
          id_usuario: usuario.id,
          tipo: TIPOS.STOCK_RECUPERADO,
          titulo,
          mensaje,
          url,
        });
      }

      logger.info(`Stock recuperado notificado para producto ${producto.id}`);
    } catch (error) {
      logger.error('Error al notificar stock recuperado:', error);
    }
  },
};

module.exports = NotificacionService;
