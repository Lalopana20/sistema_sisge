require('dotenv').config();

try {
  require('./config/env');
} catch (err) {
  console.error('[SISGE] Error de configuración:', err.message);
  process.exit(1);
}

const app    = require('./app');
const logger = require('./utils/logger');
const { iniciarTareas } = require('./tasks/cronTasks');

const PORT = process.env.PORT;

// ── Crear tablas críticas si no existen (evita fallos silenciosos) ────────────
async function garantizarTablas() {
  const db = require('./config/db');
  try {
    // sesiones_invalidas: necesaria para que el logout invalide tokens JWT
    await db.query(`
      CREATE TABLE IF NOT EXISTS sesiones_invalidas (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        id_usuario INT,
        fecha_exp  TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token_hash (token_hash),
        INDEX idx_fecha_exp  (fecha_exp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // precio_unitario: necesaria para el KPI de valor de inventario en el dashboard
    await db.query(`
      ALTER TABLE productos
      ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) DEFAULT 0.00
    `);

    // Configuracion del sistema: tabla clave/valor
    await db.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        clave       VARCHAR(100) NOT NULL UNIQUE,
        valor       VARCHAR(500) NOT NULL,
        descripcion VARCHAR(255),
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Seed permisos para el módulo configuracion (admin tiene acceso completo)
    await db.query(
      `INSERT IGNORE INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar)
       VALUES ('admin', 'configuracion', TRUE, TRUE, TRUE, TRUE)`,
    );

    // Limpiar entradas expiradas de sesiones_invalidas (evita crecimiento infinito)
    const [delResult] = await db.query(
      'DELETE FROM sesiones_invalidas WHERE fecha_exp < NOW()',
    );
    if (delResult.affectedRows > 0) {
      logger.info(`Limpiadas ${delResult.affectedRows} sesiones inválidas expiradas`);
    }

    logger.info('Tablas y columnas críticas verificadas correctamente');
  } catch (err) {
    // No detener el servidor por esto — solo avisar
    logger.warn('No se pudieron garantizar algunas tablas/columnas', { error: err.message });
  }
}

// Capturar errores de conexión a BD emitidos por db.js
// Esto centraliza el manejo de arranque fallido en un solo lugar
process.once('db:connectionError', (err) => {
  logger.error('No se pudo conectar a la base de datos al arrancar. Cerrando servidor.', { error: err.message });
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info(`Servidor SISGE iniciado en puerto ${PORT}`);
  // Verificar/crear tablas críticas y luego iniciar tareas programadas
  setTimeout(async () => {
    await garantizarTablas();
    iniciarTareas();
  }, 3000);
});
