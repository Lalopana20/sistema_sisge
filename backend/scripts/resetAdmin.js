/**
 * Resetea la contraseña de un administrador y verifica la conexión.
 * Uso: node scripts/resetAdmin.js [username] [nueva_password]
 *
 * Ejemplos:
 *   node scripts/resetAdmin.js                    → resetea Fernando con Sisge26
 *   node scripts/resetAdmin.js Omar NuevaClave123 → resetea Omar con NuevaClave123
 */
require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const TARGET_USERNAME = process.argv[2] || 'Fernando';
const NUEVA_PASSWORD  = process.argv[3] || process.env.SISGE_PASS_ADMIN || 'Sisge26';

async function main() {
  console.log(`\n🔧 SISGE — Reset de contraseña para usuario: ${TARGET_USERNAME}\n`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'sisge_almacen',
      port:     process.env.DB_PORT     || 3306,
    });
    console.log('✅ Conectado a MySQL');
  } catch (err) {
    console.error('❌ No se pudo conectar a MySQL:', err.message);
    console.error('   Verifica que XAMPP esté corriendo y la base de datos exista.');
    process.exit(1);
  }

  // Verificar que la tabla usuarios existe
  try {
    const [rows] = await conn.query('SELECT COUNT(*) AS total FROM usuarios');
    console.log(`✅ Tabla usuarios — ${rows[0].total} usuario(s) registrados`);
  } catch {
    console.error('❌ La tabla usuarios no existe. Importa sisge_almacen.sql primero.');
    await conn.end();
    process.exit(1);
  }

  // Buscar el usuario por username
  const [existe] = await conn.query(
    'SELECT id, nombre, username, rol FROM usuarios WHERE username = ?',
    [TARGET_USERNAME],
  );

  if (!existe.length) {
    console.error(`❌ No existe ningún usuario con username "${TARGET_USERNAME}".`);
    console.error('   Usuarios disponibles:');
    const [todos] = await conn.query('SELECT username, rol FROM usuarios ORDER BY nombre');
    todos.forEach(u => console.error(`   - ${u.username} (${u.rol})`));
    await conn.end();
    process.exit(1);
  }

  const usuario = existe[0];
  const hash    = await bcrypt.hash(NUEVA_PASSWORD, 10);

  await conn.query(
    'UPDATE usuarios SET password_hash = ? WHERE id = ?',
    [hash, usuario.id],
  );

  // Verificar que el hash funciona
  const [updated] = await conn.query('SELECT password_hash FROM usuarios WHERE id = ?', [usuario.id]);
  const ok = await bcrypt.compare(NUEVA_PASSWORD, updated[0].password_hash);

  if (ok) {
    console.log('✅ Contraseña actualizada correctamente');
    console.log('\n📋 Credenciales actualizadas:');
    console.log(`   Usuario:     ${usuario.username}`);
    console.log(`   Nombre:      ${usuario.nombre}`);
    console.log(`   Rol:         ${usuario.rol}`);
    console.log(`   Contraseña:  ${NUEVA_PASSWORD}\n`);
  } else {
    console.error('❌ Error al verificar el hash. Intenta de nuevo.');
  }

  await conn.end();
}

main().catch(err => {
  console.error('Error inesperado:', err.message);
  process.exit(1);
});
