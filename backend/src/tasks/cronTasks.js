const cron  = require('node-cron');
const db    = require('../config/db');
const logger = require('../utils/logger');
const { iniciarTareaAlertas } = require('./alertasTask');

const TIPOS_VALIDOS = ['INFO', 'ADVERTENCIA', 'ERROR', 'EXITO'];

async function obtenerAdmins() {
  const [rows] = await db.query(
    "SELECT id FROM usuarios WHERE rol = 'admin' AND COALESCE(activo, 1) = 1",
  );
  return rows.map(r => r.id);
}

async function notificacionExistente(id_usuario, titulo) {
  const [rows] = await db.query(
    `SELECT id FROM notificaciones
     WHERE id_usuario = ? AND titulo = ? AND leida = FALSE AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
    [id_usuario, titulo],
  );
  return rows.length > 0;
}

async function crearNotificacion(id_usuario, { tipo, titulo, mensaje, url }) {
  if (!TIPOS_VALIDOS.includes(tipo)) tipo = 'INFO';
  await db.query(
    `INSERT INTO notificaciones (id_usuario, tipo, titulo, mensaje, url) VALUES (?, ?, ?, ?, ?)`,
    [id_usuario, tipo, titulo, mensaje || null, url || null],
  );
}

async function verificarStockBajo() {
  const [productos] = await db.query(
    `SELECT id, nombre, stock_actual, stock_minimo
     FROM productos WHERE stock_actual <= stock_minimo AND activo = 1`,
  );
  if (!productos.length) return;

  const adminIds = await obtenerAdmins();
  if (!adminIds.length) return;

  for (const prod of productos) {
    const titulo = `Stock bajo: ${prod.nombre}`;
    const mensaje = `${prod.nombre} tiene ${prod.stock_actual} unidades (mínimo ${prod.stock_minimo})`;
    for (const id_usuario of adminIds) {
      const existe = await notificacionExistente(id_usuario, titulo);
      if (!existe) {
        await crearNotificacion(id_usuario, { tipo: 'ADVERTENCIA', titulo, mensaje, url: '/productos' });
      }
    }
  }
  logger.info(`Cron: ${productos.length} producto(s) con stock bajo notificados`);
}

async function verificarUbicacionesVencidas() {
  const [ubicaciones] = await db.query(
    `SELECT u.id, p.nombre AS producto, t.nombre AS tecnico,
            DATEDIFF(CURDATE(), DATE(m.fecha)) AS dias
     FROM ubicaciones_material u
     JOIN productos p ON u.id_producto = p.id
     JOIN usuarios t ON u.id_tecnico = t.id
     JOIN movimientos m ON u.id_movimiento = m.id
     WHERE u.estado != 'DEVUELTO'
       AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= 7`,
  );
  if (!ubicaciones.length) return;

  const adminIds = await obtenerAdmins();
  if (!adminIds.length) return;

  for (const ub of ubicaciones) {
    const titulo = `Ubicación vencida: ${ub.producto}`;
    const mensaje = `${ub.producto} — ${ub.tecnico} lleva ${ub.dias} días fuera del almacén`;
    for (const id_usuario of adminIds) {
      const existe = await notificacionExistente(id_usuario, titulo);
      if (!existe) {
        await crearNotificacion(id_usuario, { tipo: 'ADVERTENCIA', titulo, mensaje, url: '/ubicaciones' });
      }
    }
  }
  logger.info(`Cron: ${ubicaciones.length} ubicación(es) vencidas notificadas`);
}

function iniciarTareas() {
  logger.info('🔄 Iniciando tareas programadas...');

  // Stock bajo: cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    try {
      await verificarStockBajo();
    } catch (err) {
      logger.error('Cron stock bajo falló', { error: err.message });
    }
  });

  // Ubicaciones vencidas: cada 12 horas
  cron.schedule('0 */12 * * *', async () => {
    try {
      await verificarUbicacionesVencidas();
    } catch (err) {
      logger.error('Cron ubicaciones vencidas falló', { error: err.message });
    }
  });

  // Limpiar sesiones inválidas expiradas: cada 24 horas
  cron.schedule('0 3 * * *', async () => {
    try {
      const [result] = await db.query(
        'DELETE FROM sesiones_invalidas WHERE fecha_exp < NOW()',
      );
      if (result.affectedRows > 0) {
        logger.info(`Cron: limpiadas ${result.affectedRows} sesiones inválidas expiradas`);
      }
    } catch (err) {
      logger.error('Cron limpieza sesiones falló', { error: err.message });
    }
  });

  // ── NUEVA TAREA: Alertas diarias de devoluciones vencidas (8:00 AM) ────────
  try {
    iniciarTareaAlertas();
  } catch (err) {
    logger.error('Error al iniciar tarea de alertas diarias', { error: err.message });
  }

  logger.info('✅ Tareas programadas iniciadas correctamente');
}

module.exports = { iniciarTareas };

