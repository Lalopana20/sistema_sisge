const UbicacionModel      = require('../models/ubicacionModel');
const MovimientoModel     = require('../models/movimientoModel');
const NotificacionService = require('./notificacionService');
const db                  = require('../config/db');
const logger              = require('../utils/logger');

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const DIAS_ALERTA_DEFAULT = 7;

const UbicacionService = {

  // ── Registrar ubicación para un movimiento de SALIDA ─────────────────────
  async crear(datos, id_usuario) {
    const { id_movimiento } = datos;

    // Validar que el movimiento existe y es una SALIDA
    const mov = await MovimientoModel.findById(id_movimiento);
    if (!mov) throw httpError(404, 'Movimiento no encontrado');
    if (mov.tipo !== 'SALIDA') {
      throw httpError(400, 'Solo se puede registrar ubicación para movimientos de SALIDA');
    }
    if (!mov.id_tecnico) {
      throw httpError(400, 'El movimiento no tiene técnico asignado');
    }

    // Verificar que no exista ya una ubicación activa para este movimiento
    const existente = await UbicacionModel.findByMovimiento(id_movimiento);
    if (existente && existente.estado !== 'DEVUELTO') {
      throw httpError(409, 'Ya existe una ubicación activa para este movimiento. Edítala en lugar de crear una nueva.');
    }

    const id = await UbicacionModel.crear({
      ...datos,
      id_producto:      mov.id_producto,
      id_tecnico:       mov.id_tecnico,
      id_reportado_por: id_usuario,
    });

    return UbicacionModel.findById(id);
  },

  // ── Obtener una ubicación ─────────────────────────────────────────────────
  async obtener(id) {
    const ub = await UbicacionModel.findById(id);
    if (!ub) throw httpError(404, 'Ubicación no encontrada');
    return ub;
  },

  // ── Listar con filtros ────────────────────────────────────────────────────
  async listar(filtros) {
    return UbicacionModel.listar(filtros);
  },

  // ── Alertas: ítems fuera del almacén más de N días ────────────────────────
  async alertas(dias) {
    const limite = Number(dias) || DIAS_ALERTA_DEFAULT;
    return UbicacionModel.alertas(limite);
  },

  // ── Conteo de alertas para el dashboard ──────────────────────────────────
  async conteoAlertas(dias) {
    const limite = Number(dias) || DIAS_ALERTA_DEFAULT;
    return UbicacionModel.conteoAlertas(limite);
  },

  // ── Actualizar ubicación ──────────────────────────────────────────────────
  async actualizar(id, datos, id_usuario, rol) {
    const ub = await this.obtener(id);

    // Técnico solo puede editar sus propias ubicaciones
    if (rol === 'operario' && ub.id_tecnico !== id_usuario) {
      throw httpError(403, 'Solo puedes editar ubicaciones de tus propios materiales');
    }
    if (ub.estado === 'DEVUELTO') {
      throw httpError(400, 'No se puede editar una ubicación ya cerrada');
    }

    // ✅ CORRECCIÓN URGENTE 2: Ajustar stock cuando se marca como EXTRAVIADO
    if (datos.estado === 'EXTRAVIADO' && ub.estado !== 'EXTRAVIADO') {
      await this._ajustarStockExtraviado(ub, id_usuario);
    }

    await UbicacionModel.actualizar(id, datos);
    return UbicacionModel.findById(id);
  },

  // ── Helper: Ajustar stock cuando material se marca como EXTRAVIADO ────────
  async _ajustarStockExtraviado(ubicacion, id_usuario) {
    const ProductoModel = require('../models/productoModel');
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Obtener cantidad del movimiento de SALIDA original
      const movSalida = await MovimientoModel.findById(ubicacion.id_movimiento);
      if (!movSalida) {
        throw httpError(404, 'Movimiento de SALIDA asociado no encontrado');
      }

      // Calcular cuánto ya fue devuelto
      const [[{ ya_devuelto }]] = await conn.query(
        `SELECT COALESCE(SUM(cantidad), 0) AS ya_devuelto
         FROM movimientos
         WHERE tipo = 'DEVOLUCION' AND id_movimiento_origen = ?`,
        [ubicacion.id_movimiento],
      );

      const cantidadExtraviada = Number(movSalida.cantidad) - Number(ya_devuelto);

      // Si hay cantidad pendiente de devolver, crear ajuste negativo
      if (cantidadExtraviada > 0) {
        const [[prod]] = await conn.query(
          'SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE',
          [ubicacion.id_producto],
        );
        
        const stockNuevo = Number(prod.stock_actual) - cantidadExtraviada;
        
        await conn.query(
          'UPDATE productos SET stock_actual = ? WHERE id = ?',
          [stockNuevo, ubicacion.id_producto],
        );

        await conn.query(
          `INSERT INTO movimientos
            (id_producto, tipo, cantidad, stock_anterior, stock_nuevo,
             motivo, observaciones, id_usuario, id_movimiento_origen)
           VALUES (?, 'AJUSTE', ?, ?, ?, ?, ?, ?, ?)`,
          [
            ubicacion.id_producto,
            cantidadExtraviada, // Cantidad positiva — el tipo AJUSTE y el stock_nuevo ya reflejan la baja
            prod.stock_actual,
            stockNuevo,
            'Material extraviado - Ajuste de inventario',
            `Ubicación #${ubicacion.id} marcada como EXTRAVIADA. Baja de ${cantidadExtraviada} unidades. Material no recuperable.`,
            id_usuario,
            ubicacion.id_movimiento,
          ],
        );

        // ── NOTIFICACIÓN AUTOMÁTICA: Material extraviado ──────────────────────
        // Notificar a administradores sobre la pérdida de material
        setImmediate(async () => {
          try {
            // Obtener información completa de la ubicación para la notificación
            const ubicacionCompleta = await UbicacionModel.findById(ubicacion.id);
            if (ubicacionCompleta) {
              await NotificacionService.notificarMaterialExtraviado(
                ubicacionCompleta, 
                cantidadExtraviada
              );
            }
          } catch (error) {
            logger.error('Error al notificar material extraviado:', error);
          }
        });
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── Cerrar ubicación (marcar como devuelto) ───────────────────────────────
  async eliminar(id) {
    const ub = await this.obtener(id);
    if (ub.estado !== 'DEVUELTO') {
      throw httpError(400,
        `No se puede eliminar: la ubicación está en estado "${ub.estado}". Debe marcarse como DEVUELTO primero.`,
      );
    }
    await UbicacionModel.eliminar(id);
    return { mensaje: `Ubicación #${id} eliminada correctamente` };
  },

  async cerrar(id, nota_cierre, id_usuario, rol) {
    const ub = await this.obtener(id);

    if (ub.estado === 'DEVUELTO') {
      throw httpError(400, 'Esta ubicación ya fue cerrada');
    }
    // Técnico solo puede cerrar sus propias ubicaciones
    if (rol === 'operario' && ub.id_tecnico !== id_usuario) {
      throw httpError(403, 'Solo puedes cerrar ubicaciones de tus propios materiales');
    }

    // Obtener el movimiento de SALIDA original para saber la cantidad despachada
    const movSalida = await MovimientoModel.findById(ub.id_movimiento);
    if (!movSalida) throw httpError(404, 'Movimiento de SALIDA asociado no encontrado');

    // Calcular cuánto ya fue devuelto mediante movimientos de DEVOLUCION
    const [[{ ya_devuelto }]] = await db.query(
      `SELECT COALESCE(SUM(cantidad), 0) AS ya_devuelto
       FROM movimientos
       WHERE tipo = 'DEVOLUCION' AND id_movimiento_origen = ?`,
      [ub.id_movimiento],
    );

    // La cantidad pendiente de devolver es lo que se despachó menos lo ya devuelto
    const cantidadPendiente = Number(movSalida.cantidad) - Number(ya_devuelto);

    if (cantidadPendiente > 0) {
      // Registrar movimiento de DEVOLUCION automático para restaurar el stock
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [[prod]] = await conn.query(
          'SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE',
          [ub.id_producto],
        );
        const stockNuevo = Number(prod.stock_actual) + cantidadPendiente;
        await conn.query(
          'UPDATE productos SET stock_actual = ? WHERE id = ?',
          [stockNuevo, ub.id_producto],
        );
        await conn.query(
          `INSERT INTO movimientos
            (id_producto, tipo, cantidad, stock_anterior, stock_nuevo,
             motivo, id_usuario, id_movimiento_origen)
           VALUES (?, 'DEVOLUCION', ?, ?, ?, ?, ?, ?)`,
          [
            ub.id_producto, cantidadPendiente,
            prod.stock_actual, stockNuevo,
            `Devolución automática al cerrar ubicación #${id}`,
            id_usuario, ub.id_movimiento,
          ],
        );
        await UbicacionModel.cerrar(id, { id_cerrado_por: id_usuario, nota_cierre });
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } else {
      // Todo ya fue devuelto mediante movimientos explícitos — solo cerrar la ubicación
      await UbicacionModel.cerrar(id, { id_cerrado_por: id_usuario, nota_cierre });
    }

    return UbicacionModel.findById(id);
  },
};

module.exports = UbicacionService;
