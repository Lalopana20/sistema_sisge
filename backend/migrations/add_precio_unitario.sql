-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar campo precio_unitario a productos
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- Para calcular el valor total del inventario, necesitamos el precio unitario
-- de cada producto.

USE sisge_almacen;

-- Verificar si la columna ya existe antes de agregarla
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'sisge_almacen' 
  AND TABLE_NAME = 'productos' 
  AND COLUMN_NAME = 'precio_unitario'
);

SET @query = IF(
  @col_exists = 0,
  'ALTER TABLE productos ADD COLUMN precio_unitario DECIMAL(10,2) DEFAULT 0.00 AFTER stock_minimo',
  'SELECT "La columna precio_unitario ya existe" as mensaje'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar algunos precios de ejemplo (opcional)
UPDATE productos SET precio_unitario = 2.50 WHERE nombre LIKE '%Cable%' AND precio_unitario = 0;
UPDATE productos SET precio_unitario = 150.00 WHERE nombre LIKE '%Taladro%' AND precio_unitario = 0;
UPDATE productos SET precio_unitario = 80.00 WHERE nombre LIKE '%Sierra%' AND precio_unitario = 0;
UPDATE productos SET precio_unitario = 1.00 WHERE nombre LIKE '%Tornillo%' AND precio_unitario = 0;
UPDATE productos SET precio_unitario = 3.50 WHERE nombre LIKE '%Cinta%' AND precio_unitario = 0;

SELECT 'Migración completada: precio_unitario agregado a productos' as mensaje;
