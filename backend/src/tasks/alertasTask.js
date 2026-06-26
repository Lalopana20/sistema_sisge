/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TAREA CRON: ALERTAS AUTOMÁTICAS DIARIAS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Esta tarea se ejecuta automáticamente cada día a las 8:00 AM para:
 * 
 * 1. Revisar ubicaciones con devolución vencida (>7 días sin devolver)
 * 2. Notificar a técnicos responsables
 * 3. Notificar a supervisores y administradores
 * 
 * Configuración: Se ejecuta con node-cron
 * Frecuencia: Diario a las 8:00 AM (0 8 * * *)
 */

const cron                  = require('node-cron');
const db                    = require('../config/db');
const UbicacionModel        = require('../models/ubicacionModel');
const NotificacionService   = require('../services/notificacionService');
const logger                = require('../utils/logger');

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const DIAS_LIMITE_ALERTA = 7;
const CRON_SCHEDULE = '0 8 * * *'; // 8:00 AM todos los días

/**
 * Verificar si ya existe una notificación no leída con ese título
 * para el usuario en las últimas 24h — evita duplicados con el cron de cronTasks.js
 */
async function notificacionExistente(id_usuario, titulo) {
  try {
    const [rows] = await db.query(
      `SELECT id FROM notificaciones
       WHERE id_usuario = ? AND titulo = ? AND leida = FALSE
         AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
       LIMIT 1`,
      [id_usuario, titulo],
    );
    return rows.length > 0;
  } catch {
    return false; // Si falla la consulta, permitir crear la notificación
  }
}

/**
 * Procesar alertas de devolución vencida con deduplicación
 */
async function procesarAlertasDevolucion() {
  try {
    logger.info('⏰ Iniciando proceso de alertas diarias...');

    const ubicacionesVencidas = await UbicacionModel.alertas(DIAS_LIMITE_ALERTA);

    if (ubicacionesVencidas.length === 0) {
      logger.info('✅ No hay ubicaciones con devolución vencida');
      return;
    }

    logger.info(`📋 Se encontraron ${ubicacionesVencidas.length} ubicación(es) con devolución vencida`);

    let notificacionesEnviadas = 0;
    let notificacionesOmitidas = 0;

    for (const ubicacion of ubicacionesVencidas) {
      try {
        // ── Notificar al técnico responsable (con deduplicación) ──────────────
        const tituloTecnico = `⏰ Devolución vencida - Acción requerida`;
        const yaNotificadoTecnico = await notificacionExistente(ubicacion.id_tecnico, tituloTecnico);
        if (!yaNotificadoTecnico) {
          await NotificacionService.notificarDevolucionVencida(ubicacion, 'tecnico');
          notificacionesEnviadas++;
        } else {
          notificacionesOmitidas++;
        }

        // ── Notificar a supervisores/admins (con deduplicación por ubicación) ──
        const tituloAdmin = `⚠️ ${ubicacion.tecnico} tiene material vencido`;
        // Obtener destinatarios para verificar duplicados individualmente
        const destinatarios = await NotificacionService.obtenerDestinatarios(['admin', 'supervisor']);
        let hayNuevos = false;
        for (const dest of destinatarios) {
          const yaNotificado = await notificacionExistente(dest.id, tituloAdmin);
          if (!yaNotificado) { hayNuevos = true; break; }
        }
        if (hayNuevos) {
          await NotificacionService.notificarDevolucionVencida(ubicacion, 'supervisor');
          notificacionesEnviadas++;
        } else {
          notificacionesOmitidas++;
        }

        logger.info(`  ✓ Ubicación #${ubicacion.id} (${ubicacion.producto}) procesada`);
      } catch (error) {
        logger.error(`  ✗ Error al procesar ubicación #${ubicacion.id}:`, error);
      }
    }

    logger.info(`✅ Proceso completado: ${notificacionesEnviadas} enviada(s), ${notificacionesOmitidas} omitida(s) por duplicado`);
  } catch (error) {
    logger.error('❌ Error en proceso de alertas diarias:', error);
  }
}

/**
 * Inicializar tarea cron
 */
function iniciarTareaAlertas() {
  // Validar que node-cron.schedule esté disponible
  if (!cron || !cron.schedule) {
    logger.error('❌ node-cron no está disponible. Las alertas automáticas no se iniciarán.');
    return null;
  }

  logger.info(`🔔 Configurando tarea de alertas diarias (${CRON_SCHEDULE})...`);

  const task = cron.schedule(CRON_SCHEDULE, async () => {
    await procesarAlertasDevolucion();
  }, {
    scheduled: true,
    timezone: 'America/Lima', // Ajustar según tu zona horaria
  });

  logger.info('✅ Tarea de alertas diarias configurada correctamente');
  logger.info(`   - Se ejecutará diariamente a las 8:00 AM`);
  logger.info(`   - Alertará ubicaciones con más de ${DIAS_LIMITE_ALERTA} días sin devolver`);

  return task;
}

/**
 * Ejecutar alertas manualmente (útil para testing)
 */
async function ejecutarManualmente() {
  logger.info('🔧 Ejecutando alertas manualmente...');
  await procesarAlertasDevolucion();
}

// ── EXPORTAR ─────────────────────────────────────────────────────────────────
module.exports = {
  iniciarTareaAlertas,
  ejecutarManualmente,
  procesarAlertasDevolucion,
};
