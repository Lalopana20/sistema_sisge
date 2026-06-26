-- ============================================================
-- SISGE - Migración: columna activo en subcategorias
-- Permite soft delete consistente con el resto de entidades.
-- Ejecutar en phpMyAdmin sobre sisge_almacen
-- ============================================================

USE sisge_almacen;

ALTER TABLE subcategorias
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1 AFTER descripcion,
  ADD INDEX IF NOT EXISTS idx_subcategoria_activo (activo);

-- Para MySQL 5.7 (no soporta IF NOT EXISTS en ADD COLUMN):
-- ALTER TABLE subcategorias ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER descripcion;
-- ALTER TABLE subcategorias ADD INDEX idx_subcategoria_activo (activo);
