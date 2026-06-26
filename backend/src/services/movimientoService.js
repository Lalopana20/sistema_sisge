const db                  = require('../config/db');
const ProductoModel       = require('../models/productoModel');
const MovimientoModel     = require('../models/movimientoModel');
const NotificacionService = require('./notificacionService');
const logger              = require('../utils/logger');

const httpError = (status, message) => {
  const err = new Error(message); err.status = status; return err;
};

const TIPOS_VALIDOS = ['ENTRADA', 'SALIDA', 'DEVOLUCION', 'AJUSTE'];

const MovimientoService = {
  async registrar(datos, id_usuario) {
    const { id_producto, tipo, cantidad, id_movimiento_origen } = datos;

    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw httpError(400, `Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}`);
    }

    const producto = await ProductoModel.findById(id_producto);
    if (!producto) throw httpError(404, 'Producto no encontrado');

    // Para DEVOLUCION, validar que el movimiento origen existe y es una SALIDA
    if (tipo === 'DEVOLUCION') {
      if (!id_movimiento_origen) {
        throw httpError(400, 'Una devolución debe especificar el movimiento de SALIDA original (id_movimiento_origen)');
      }
      const movOrigen = await MovimientoModel.findById(id_movimiento_origen);
      if (!movOrigen) throw httpError(404, 'Movimiento de SALIDA original no encontrado');
      if (movOrigen.tipo !== 'SALIDA') throw httpError(400, 'El movimiento origen debe ser de tipo SALIDA');
      if (movOrigen.id_producto !== Number(id_producto)) throw httpError(400, 'El producto no coincide con el movimiento origen');
      // Validar que no se devuelva más de lo que se sacó
      if (Number(cantidad) > Number(movOrigen.cantidad)) {
        throw httpError(400, `No puedes devolver más de lo que se despachó. Cantidad original: ${movOrigen.cantidad}`);
      }
      // Validar que no se haya devuelto ya más de lo despachado (devoluciones parciales acumuladas)
      const [[{ ya_devuelto }]] = await db.query(
        `SELECT COALESCE(SUM(cantidad), 0) AS ya_devuelto
         FROM movimientos
         WHERE tipo = 'DEVOLUCION' AND id_movimiento_origen = ?`,
        [id_movimiento_origen],
      );
      const disponibleDevolver = Number(movOrigen.cantidad) - Number(ya_devuelto);
      if (Number(cantidad) > disponibleDevolver) {
        throw httpError(400,
          `Ya se devolvieron ${ya_devuelto} unidades de este despacho. ` +
          `Solo puedes devolver hasta ${disponibleDevolver} unidades más.`,
        );
      }
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Leer stock actual con bloqueo pesimista para TODOS los tipos de movimiento
      const [rows] = await conn.query(
        'SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE',
        [id_producto],
      );
      const stockActual = Number(rows[0]?.stock_actual || 0);
      let stock_nuevo;

      if (tipo === 'ENTRADA' || tipo === 'DEVOLUCION') {
        stock_nuevo = stockActual + Number(cantidad);
      } else if (tipo === 'SALIDA') {
        if (stockActual < Number(cantidad)) {
          throw httpError(400, `Stock insuficiente. Disponible: ${stockActual}`);
        }
        stock_nuevo = stockActual - Number(cantidad);
      } else if (tipo === 'AJUSTE') {
        stock_nuevo = Number(cantidad);
      }

      await ProductoModel.actualizarStock(id_producto, stock_nuevo, conn);
      const id_movimiento = await MovimientoModel.crear(
        { ...datos, stock_anterior: stockActual, stock_nuevo, id_usuario }, conn,
      );
      await conn.commit();

      logger.info('Movimiento registrado', { tipo, id_producto, cantidad, stock_anterior: stockActual, stock_nuevo, id_usuario });

      // ── NOTIFICACIÓN AUTOMÁTICA: Stock bajo después de SALIDA ────────────────
      // Si es una SALIDA y el stock nuevo está en o bajo el mínimo, notificar
      if (tipo === 'SALIDA' && stock_nuevo <= Number(producto.stock_minimo)) {
        // Ejecutar notificación de forma asíncrona sin bloquear la respuesta
        setImmediate(async () => {
          try {
            await NotificacionService.notificarStockBajo({
              ...producto,
              stock_actual: stock_nuevo, // Usar el stock actualizado
            });
          } catch (error) {
            logger.error('Error al notificar stock bajo:', error);
          }
        });
      }

      // ── NOTIFICACIÓN AUTOMÁTICA: Stock recuperado después de ENTRADA/DEVOLUCIÓN
      // Si el stock estaba bajo y ahora se recupera, notificar (opcional)
      if ((tipo === 'ENTRADA' || tipo === 'DEVOLUCION') && 
          stockActual <= Number(producto.stock_minimo) && 
          stock_nuevo > Number(producto.stock_minimo)) {
        setImmediate(async () => {
          try {
            await NotificacionService.notificarStockRecuperado({
              ...producto,
              stock_actual: stock_nuevo,
            });
          } catch (error) {
            logger.error('Error al notificar stock recuperado:', error);
          }
        });
      }

      return MovimientoModel.findById(id_movimiento);
    } catch (err) {
      await conn.rollback();
      logger.error('Movimiento fallido', { tipo, id_producto, cantidad, error: err.message });
      throw err;
    } finally {
      conn.release();
    }
  },

  async listar(filtros) {
    return MovimientoModel.listar(filtros);
  },

  async actualizar(id, datos) {
    const mov = await this.obtener(id);
    await MovimientoModel.actualizar(id, datos);
    return MovimientoModel.findById(id);
  },

  async obtener(id) {
    const mov = await MovimientoModel.findById(id);
    if (!mov) throw httpError(404, 'Movimiento no encontrado');
    return mov;
  },
};

module.exports = MovimientoService;
