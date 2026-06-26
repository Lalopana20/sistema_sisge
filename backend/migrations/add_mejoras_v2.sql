-- ============================================================
-- SISGE - Migración v2: Mejoras de lógica y seguridad
-- ============================================================

-- 1. Agregar columna id_movimiento_origen en movimientos
ALTER TABLE movimientos
  ADD COLUMN id_movimiento_origen INT NULL AFTER id_orden_trabajo,
  ADD INDEX idx_movimiento_origen (id_movimiento_origen);

-- 2. Agregar columna activo para soft delete
ALTER TABLE productos
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER unidad_medida,
  ADD INDEX idx_producto_activo (activo);

ALTER TABLE categorias
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER descripcion,
  ADD INDEX idx_categoria_activo (activo);

ALTER TABLE usuarios
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER rol,
  ADD INDEX idx_usuario_activo (activo);

-- 3. Índice para búsqueda de devoluciones vencidas
ALTER TABLE ubicaciones_material
  ADD INDEX idx_fecha_esperada_dev (fecha_esperada_dev);

-- 4. Extender ENUM de movimientos para incluir id_movimiento_origen referencial
-- (no es FK estricta para evitar ciclos, se valida en service)

-- 5. Agregar columna id_movimiento_origen en la tabla movimientos (ya hecho arriba)
