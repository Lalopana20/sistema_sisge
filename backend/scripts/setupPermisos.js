/**
 * Script para crear tablas de permisos y datos iniciales
 * Ejecutar: node scripts/setupPermisos.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function ejecutarMigracion() {
  try {
    console.log('📋 Ejecutando migración de permisos y tablas...\n');

    const sqlPath = path.join(__dirname, '../migrations/add_permisos_y_tablas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir por punto y coma y ejecutar cada sentencia
    const sentencias = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const sentencia of sentencias) {
      try {
        await db.query(sentencia);
      } catch (error) {
        // Ignorar errores de duplicados o tablas existentes
        if (!error.message.includes('Duplicate') && !error.message.includes('already exists')) {
          console.error('❌ Error en sentencia:', error.message);
        }
      }
    }

    console.log('✅ Migración completada exitosamente\n');

    // Verificar permisos creados
    const [permisos] = await db.query('SELECT COUNT(*) as total FROM permisos');
    console.log(`📊 Total de permisos configurados: ${permisos[0].total}`);

    // Mostrar permisos por rol
    const [permisosAdmin] = await db.query(
      'SELECT modulo, puede_ver, puede_crear, puede_editar, puede_eliminar FROM permisos WHERE rol = "admin" ORDER BY modulo',
    );
    console.log('\n👑 Permisos de ADMIN:');
    console.table(permisosAdmin);

    const [permisosOperario] = await db.query(
      'SELECT modulo, puede_ver, puede_crear, puede_editar, puede_eliminar FROM permisos WHERE rol = "operario" ORDER BY modulo',
    );
    console.log('\n👷 Permisos de OPERARIO:');
    console.table(permisosOperario);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

ejecutarMigracion();
