const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Cargar dotenv explícitamente antes de usar process.env
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sisge_almacen',
  port:     Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  connectTimeout:     10000,
  // acquireTimeout no es opción válida en mysql2 — se maneja con queueLimit + waitForConnections
  timezone:           '+00:00',
  // Reconexión automática ante caídas de MySQL
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

// Verificar conexión al iniciar (no bloquea el arranque)
// Se emite un evento en lugar de llamar process.exit directamente,
// para que index.js pueda manejar el error con cleanup si es necesario.
pool.getConnection()
  .then(conn => {
    logger.info('Conectado a MySQL', { database: process.env.DB_NAME });
    conn.release();
  })
  .catch(err => {
    logger.error('Error al conectar a MySQL — verifica que MySQL esté corriendo y las credenciales en .env', { error: err.message });
    // Emitir el error para que el proceso principal lo capture en index.js
    process.emit('db:connectionError', err);
  });

module.exports = pool;
