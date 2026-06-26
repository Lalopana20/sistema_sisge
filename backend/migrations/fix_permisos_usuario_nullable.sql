-- ============================================================
-- FIX: Cambiar permisos_usuario para permitir NULL en permisos
-- Los valores NULL indican "heredar del rol"
-- Ejecutar UNA VEZ en phpMyAdmin sobre sisge_almacen
-- ============================================================

USE sisge_almacen;

-- Verificar si la tabla existe
SET @tabla_existe = (SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'permisos_usuario');

-- Modificar columnas para permitir NULL
SET @sql = IF(@tabla_existe > 0,
  'ALTER TABLE permisos_usuario
    MODIFY COLUMN puede_ver       BOOLEAN NULL DEFAULT NULL,
    MODIFY COLUMN puede_crear     BOOLEAN NULL DEFAULT NULL,
    MODIFY COLUMN puede_editar    BOOLEAN NULL DEFAULT NULL,
    MODIFY COLUMN puede_eliminar  BOOLEAN NULL DEFAULT NULL',
  'SELECT ''Tabla permisos_usuario no existe - crear con add_permisos_usuario.sql''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros existentes: FALSE → NULL para heredar del rol
-- Solo mantener valores explícitos donde se había guardado TRUE
SET @sql = IF(@tabla_existe > 0,
  'UPDATE permisos_usuario SET
    puede_ver = IF(puede_ver = 1, TRUE, NULL),
    puede_crear = IF(puede_crear = 1, TRUE, NULL),
    puede_editar = IF(puede_editar = 1, TRUE, NULL),
    puede_eliminar = IF(puede_eliminar = 1, TRUE, NULL)
  WHERE puede_ver = 0 OR puede_crear = 0 OR puede_editar = 0 OR puede_eliminar = 0',
  'SELECT ''No hay registros para actualizar''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Tabla permisos_usuario modificada correctamente (columnas NULLABLE)' AS resultado;
