-- Migración: subcategorías + columna en productos
-- Ejecutar en phpMyAdmin sobre sisge_almacen (si ya tenías la BD creada)

USE sisge_almacen;

CREATE TABLE IF NOT EXISTS subcategorias (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria  INT NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_subcat_cat_nombre (id_categoria, nombre)
);

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS id_subcategoria INT NULL AFTER id_categoria;

-- MySQL 5.7 no soporta IF NOT EXISTS en ADD COLUMN; si falla, ignorar si ya existe:
-- ALTER TABLE productos ADD COLUMN id_subcategoria INT NULL AFTER id_categoria;

ALTER TABLE productos
  ADD CONSTRAINT fk_producto_subcategoria
  FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id) ON DELETE SET NULL;
