/**
 * Prueba el login directamente contra la DB sin pasar por Express
 * Ejecutar: node scripts/testLogin.js
 */
require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

async function main() {
  console.log('\n🔍 SISGE — Test de login directo\n');

  const username = process.argv[2] || process.env.TEST_USER || 'Fernando';
  const password = process.argv[3] || process.env.TEST_PASS || 'Sisge26';

  // Conectar
  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'sisge_almacen',
      port:     Number(process.env.DB_PORT) || 3306,
    });
    console.log('✅ Conexión a MySQL: OK');
  } catch (err) {
    console.error('❌ MySQL no conecta:', err.message);
    console.error('   → Verifica que XAMPP MySQL esté corriendo');
    process.exit(1);
  }

  // Buscar usuario por username
  const [rows] = await conn.query('SELECT * FROM usuarios WHERE username = ?', [username]);
  if (rows.length === 0) {
    console.error('❌ Usuario no encontrado en la DB para:', username);
    console.error('   Usa: node scripts/testLogin.js <username> <password>');
    await conn.end();
    process.exit(1);
  }

  const usuario = rows[0];
  console.log('✅ Usuario encontrado:', usuario.username, '| Rol:', usuario.rol);
  console.log('   Hash en DB:', usuario.password_hash);

  // Verificar contraseña
  const match = await bcrypt.compare(password, usuario.password_hash);
  console.log(`${match ? '✅' : '❌'} bcrypt.compare("${password}", hash) =`, match);

  if (!match) {
    console.error('\n❌ La contraseña NO coincide con el hash en la DB');
    console.error('   → Ejecuta: node scripts/resetAdmin.js');
    await conn.end();
    process.exit(1);
  }

  // Generar JWT
  const secret = process.env.JWT_SECRET;
  console.log('✅ JWT_SECRET cargado:', secret ? 'SÍ' : 'NO — falta en .env');

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    secret,
    { expiresIn: '8h' },
  );
  console.log('✅ Token JWT generado correctamente');
  console.log('\n🎉 Login funcionaría correctamente. El problema es otro (CORS, proxy, etc.)');
  console.log('\nToken (primeros 50 chars):', token.substring(0, 50) + '...');

  await conn.end();
}

main().catch(err => {
  console.error('Error inesperado:', err.message);
  process.exit(1);
});
