/**
 * Crea la tabla de auditoría del sistema.
 * Ejecutar: node scripts/setupAuditoria.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  console.log('\n🔧 SISGE — Tabla de auditoría\n');

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'sisge_almacen',
    port:     process.env.DB_PORT     || 3306,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id              BIGINT AUTO_INCREMENT PRIMARY KEY,
      fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      id_usuario      INT NULL,
      usuario_nombre  VARCHAR(100),
      usuario_email   VARCHAR(150),
      usuario_rol     VARCHAR(20),
      accion          ENUM(
        'LOGIN', 'LOGIN_FALLIDO', 'LOGOUT',
        'CREAR', 'EDITAR', 'ELIMINAR',
        'REGISTRAR_MOVIMIENTO', 'CAMBIAR_PASSWORD', 'CERRAR_UBICACION'
      ) NOT NULL,
      modulo          VARCHAR(50) NOT NULL,
      entidad_id      INT NULL,
      entidad_nombre  VARCHAR(200),
      detalle         JSON NULL,
      ip              VARCHAR(45),
      user_agent      VARCHAR(255),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
      INDEX idx_aud_fecha (fecha),
      INDEX idx_aud_modulo (modulo),
      INDEX idx_aud_usuario (id_usuario),
      INDEX idx_aud_accion (accion)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log('✅ Tabla auditoria lista\n');
  await conn.end();
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
