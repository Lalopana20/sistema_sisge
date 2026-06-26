/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCRIPT DE TESTING: ALERTAS AUTOMÁTICAS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este script permite probar manualmente el sistema de alertas de
 * devoluciones vencidas sin esperar a las 8:00 AM.
 * 
 * Uso:
 *   node scripts/testAlertas.js
 */

require('dotenv').config();

const { ejecutarManualmente, procesarAlertasDevolucion } = require('../src/tasks/alertasTask');

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧪 TEST: SISTEMA DE ALERTAS DE DEVOLUCIÓN VENCIDA');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  try {
    console.log('⏱️  Iniciando proceso de alertas...');
    console.log('');

    await ejecutarManualmente();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Revisa la tabla notificaciones para ver los resultados:');
    console.log('   SELECT * FROM notificaciones WHERE tipo = \'DEVOLUCION_VENCIDA\' ORDER BY created_at DESC LIMIT 10;');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  ❌ ERROR EN EL TEST');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

main();
