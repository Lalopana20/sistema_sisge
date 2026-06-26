/**
 * Crea o actualiza los usuarios del sistema SISGE.
 * Ejecutar: node scripts/setupUsuarios.js
 */
require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const PASS_ADMIN  = process.env.SISGE_PASS_ADMIN  || 'Sisge26';
const PASS_OP     = process.env.SISGE_PASS_OPERARIO || 'Sisge2026';

const USUARIOS = [
  { nombre: 'Fernando', username: 'Fernando', email: 'fernando@sisge.com', password: PASS_ADMIN, rol: 'admin' },
  { nombre: 'Omar',     username: 'Omar',     email: 'omar@sisge.com',     password: PASS_ADMIN, rol: 'admin' },
  { nombre: 'Santiago', username: 'Santiago', email: 'santiago@sisge.com', password: PASS_OP,    rol: 'operario' },
  { nombre: 'Alvaro',   username: 'Alvaro',   email: 'alvaro@sisge.com',   password: PASS_OP,    rol: 'operario' },
  { nombre: 'Rodolfo',  username: 'Rodolfo',  email: 'rodolfo@sisge.com',  password: PASS_OP,    rol: 'operario' },
  { nombre: 'Antonio',  username: 'Antonio',  email: 'antonio@sisge.com',  password: PASS_OP,    rol: 'operario' },
];

async function main() {
  console.log('\n🔧 SISGE — Configuración de usuarios\n');

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'sisge_almacen',
    port:     process.env.DB_PORT     || 3306,
  });

  // Asegurar que la columna username existe antes de continuar
  await conn.query(`
    ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) NULL UNIQUE AFTER nombre
  `).catch(() => {}); // ignorar si ya existe en versiones MySQL < 8 que no soportan IF NOT EXISTS

  // Eliminar usuario admin antiguo si existe
  await conn.query('DELETE FROM usuarios WHERE email = ?', ['admin@sisge.com']);

  for (const u of USUARIOS) {
    const hash = await bcrypt.hash(u.password, 10);
    const [existe] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [u.email]);

    if (existe.length > 0) {
      await conn.query(
        'UPDATE usuarios SET nombre = ?, username = ?, password_hash = ?, rol = ? WHERE email = ?',
        [u.nombre, u.username, hash, u.rol, u.email],
      );
      console.log(`✅ Actualizado: ${u.nombre} (usuario: ${u.username}) — rol: ${u.rol}`);
    } else {
      await conn.query(
        'INSERT INTO usuarios (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
        [u.nombre, u.username, u.email, hash, u.rol],
      );
      console.log(`✅ Creado: ${u.nombre} (usuario: ${u.username}) — rol: ${u.rol}`);
    }
  }

  // Hacer NOT NULL la columna username una vez poblada
  await conn.query(`
    ALTER TABLE usuarios MODIFY COLUMN username VARCHAR(50) NOT NULL
  `).catch(() => {});

  console.log('\n📋 Usuarios configurados. Las contraseñas se definen via variables de entorno:');
  console.log('   SISGE_PASS_ADMIN    (default: Sisge26)   — para admins');
  console.log('   SISGE_PASS_OPERARIO (default: Sisge2026) — para operarios');
  console.log('   ⚠️  Cambia estas contraseñas por defecto en producción.\n');

  await conn.end();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
