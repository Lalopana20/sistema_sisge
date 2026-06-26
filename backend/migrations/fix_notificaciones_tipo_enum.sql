-- ============================================================
-- FIX: Ampliar ENUM notificaciones.tipo para fase 3
-- Añade tipos automáticos: STOCK_BAJO, STOCK_RECUPERADO,
-- DEVOLUCION_VENCIDA, DEVOLUCION_PROXIMA, MATERIAL_EXTRAVIADO
-- Ejecutar UNA VEZ en phpMyAdmin sobre sisge_almacen
-- ============================================================

USE sisge_almacen;

-- Verificar si la tabla existe
SET @tabla_existe = (SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'notificaciones');

-- Modificar el ENUM para incluir todos los tipos
SET @sql = IF(@tabla_existe > 0,
  'ALTER TABLE notificaciones MODIFY COLUMN tipo ENUM(
    ''INFO'',
    ''ADVERTENCIA'',
    ''ERROR'',
    ''EXITO'',
    ''STOCK_BAJO'',
    ''STOCK_RECUPERADO'',
    ''DEVOLUCION_VENCIDA'',
    ''DEVOLUCION_PROXIMA'',
    ''MATERIAL_EXTRAVIADO''
  ) DEFAULT ''INFO''',
  'SELECT ''Tabla notificaciones no existe - crear con add_permisos_y_tablas.sql''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'ENUM notificaciones.tipo actualizado correctamente' AS resultado;
