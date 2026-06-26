-- ============================================================
--  SISGE — FIX COMPLETO v2: Tablas faltantes + columnas + datos
--  Ejecutar UNA SOLA VEZ en phpMyAdmin sobre sisge_almacen
--  Orden: este archivo primero, luego seed_datos.sql si es BD nueva
-- ============================================================

USE sisge_almacen;

-- ============================================================
-- PASO 1: Columnas faltantes en tablas base
-- ============================================================

SET @dbname = DATABASE();

-- productos.activo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'productos' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE productos ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER unidad_medida',
  'SELECT "productos.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- categorias.activo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'categorias' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE categorias ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER descripcion',
  'SELECT "categorias.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- usuarios.activo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'usuarios' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER rol',
  'SELECT "usuarios.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- usuarios.username
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'usuarios' AND column_name = 'username');
SET @sql = IF(@col = 0,
  'ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) NULL UNIQUE AFTER nombre',
  'SELECT "usuarios.username ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Poblar username desde email si está vacío
UPDATE usuarios SET username = SUBSTRING_INDEX(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- movimientos.id_movimiento_origen
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND column_name = 'id_movimiento_origen');
SET @sql = IF(@col = 0,
  'ALTER TABLE movimientos ADD COLUMN id_movimiento_origen INT NULL AFTER id_orden_trabajo',
  'SELECT "movimientos.id_movimiento_origen ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- movimientos.observaciones
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND column_name = 'observaciones');
SET @sql = IF(@col = 0,
  'ALTER TABLE movimientos ADD COLUMN observaciones TEXT NULL AFTER id_movimiento_origen',
  'SELECT "movimientos.observaciones ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- movimientos.id_tecnico
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND column_name = 'id_tecnico');
SET @sql = IF(@col = 0,
  'ALTER TABLE movimientos ADD COLUMN id_tecnico INT NULL AFTER id_usuario',
  'SELECT "movimientos.id_tecnico ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- movimientos.id_orden_trabajo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND column_name = 'id_orden_trabajo');
SET @sql = IF(@col = 0,
  'ALTER TABLE movimientos ADD COLUMN id_orden_trabajo VARCHAR(50) NULL AFTER id_tecnico',
  'SELECT "movimientos.id_orden_trabajo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- movimientos.referencia_doc
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND column_name = 'referencia_doc');
SET @sql = IF(@col = 0,
  'ALTER TABLE movimientos ADD COLUMN referencia_doc VARCHAR(100) NULL AFTER motivo',
  'SELECT "movimientos.referencia_doc ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- productos.id_subcategoria
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'productos' AND column_name = 'id_subcategoria');
SET @sql = IF(@col = 0,
  'ALTER TABLE productos ADD COLUMN id_subcategoria INT NULL AFTER id_categoria',
  'SELECT "productos.id_subcategoria ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- subcategorias.activo (para soft delete consistente)
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'subcategorias' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE subcategorias ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER descripcion',
  'SELECT "subcategorias.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 2: Tabla subcategorias (si no existe)
-- ============================================================
CREATE TABLE IF NOT EXISTS subcategorias (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria  INT NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_subcat_cat_nombre (id_categoria, nombre)
);

-- FK de productos → subcategorias (si no existe)
SET @fk = (SELECT COUNT(*) FROM information_schema.key_column_usage
  WHERE table_schema = @dbname AND table_name = 'productos'
  AND constraint_name = 'fk_producto_subcategoria');
SET @sql = IF(@fk = 0,
  'ALTER TABLE productos ADD CONSTRAINT fk_producto_subcategoria FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id) ON DELETE SET NULL',
  'SELECT "FK fk_producto_subcategoria ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- FK de movimientos → usuarios (id_tecnico)
SET @fk = (SELECT COUNT(*) FROM information_schema.key_column_usage
  WHERE table_schema = @dbname AND table_name = 'movimientos'
  AND constraint_name = 'fk_movimiento_tecnico');
SET @sql = IF(@fk = 0,
  'ALTER TABLE movimientos ADD CONSTRAINT fk_movimiento_tecnico FOREIGN KEY (id_tecnico) REFERENCES usuarios(id) ON DELETE SET NULL',
  'SELECT "FK fk_movimiento_tecnico ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 3: Tabla permisos
-- ============================================================
CREATE TABLE IF NOT EXISTS permisos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  rol            ENUM('admin','supervisor','operario') NOT NULL,
  modulo         VARCHAR(50) NOT NULL,
  puede_ver      BOOLEAN NOT NULL DEFAULT FALSE,
  puede_crear    BOOLEAN NOT NULL DEFAULT FALSE,
  puede_editar   BOOLEAN NOT NULL DEFAULT FALSE,
  puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uk_rol_modulo (rol, modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PASO 4: Tabla permisos_usuario (overrides individuales)
-- ============================================================
CREATE TABLE IF NOT EXISTS permisos_usuario (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario     INT NOT NULL,
  modulo         VARCHAR(50) NOT NULL,
  puede_ver      BOOLEAN NOT NULL DEFAULT FALSE,
  puede_crear    BOOLEAN NOT NULL DEFAULT FALSE,
  puede_editar   BOOLEAN NOT NULL DEFAULT FALSE,
  puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
  asignado_por   INT NULL,
  motivo         VARCHAR(255) NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuario_modulo (id_usuario, modulo),
  FOREIGN KEY (id_usuario)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PASO 5: Tabla auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario      INT NULL,
  usuario_nombre  VARCHAR(100),
  usuario_email   VARCHAR(150),
  usuario_rol     VARCHAR(20),
  accion          VARCHAR(50) NOT NULL,
  modulo          VARCHAR(50) NOT NULL,
  entidad_id      INT NULL,
  entidad_nombre  VARCHAR(200),
  detalle         JSON NULL,
  ip              VARCHAR(45),
  user_agent      VARCHAR(255),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_aud_fecha   (fecha),
  INDEX idx_aud_modulo  (modulo),
  INDEX idx_aud_usuario (id_usuario),
  INDEX idx_aud_accion  (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PASO 6: Tabla sesiones_invalidas (para invalidar JWT en logout)
-- ============================================================
CREATE TABLE IF NOT EXISTS sesiones_invalidas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  id_usuario INT NOT NULL,
  fecha_exp  TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_fecha_exp  (fecha_exp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PASO 7: Tabla ubicaciones_material
-- ============================================================
CREATE TABLE IF NOT EXISTS ubicaciones_material (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  id_movimiento     INT NOT NULL,
  id_producto       INT NOT NULL,
  id_tecnico        INT NOT NULL,
  ubicacion         VARCHAR(200) NOT NULL,
  motivo            VARCHAR(200) NOT NULL,
  descripcion       TEXT,
  estado            ENUM('EN_USO','EN_OBRA','PENDIENTE_DEV','EXTRAVIADO','DEVUELTO') NOT NULL DEFAULT 'EN_USO',
  fecha_esperada_dev DATE NULL,
  fecha_devolucion   TIMESTAMP NULL,
  id_reportado_por  INT NOT NULL,
  id_cerrado_por    INT NULL,
  nota_cierre       TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_movimiento)    REFERENCES movimientos(id)  ON DELETE RESTRICT,
  FOREIGN KEY (id_producto)      REFERENCES productos(id)    ON DELETE RESTRICT,
  FOREIGN KEY (id_tecnico)       REFERENCES usuarios(id)     ON DELETE RESTRICT,
  FOREIGN KEY (id_reportado_por) REFERENCES usuarios(id)     ON DELETE RESTRICT,
  FOREIGN KEY (id_cerrado_por)   REFERENCES usuarios(id)     ON DELETE SET NULL,
  INDEX idx_ub_movimiento (id_movimiento),
  INDEX idx_ub_tecnico    (id_tecnico),
  INDEX idx_ub_estado     (estado),
  INDEX idx_fecha_esperada_dev (fecha_esperada_dev)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PASO 8: Índices de optimización
-- ============================================================
SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_tipo');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_movimientos_tipo ON movimientos(tipo)',
  'SELECT "idx_movimientos_tipo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_fecha');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_movimientos_fecha ON movimientos(fecha)',
  'SELECT "idx_movimientos_fecha ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_tecnico');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_movimientos_tecnico ON movimientos(id_tecnico)',
  'SELECT "idx_movimientos_tecnico ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'productos' AND index_name = 'idx_productos_categoria');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_productos_categoria ON productos(id_categoria)',
  'SELECT "idx_productos_categoria ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'productos' AND index_name = 'idx_productos_stock');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_productos_stock ON productos(stock_actual)',
  'SELECT "idx_productos_stock ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 9: Datos iniciales de permisos por rol
-- ============================================================
INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES
-- ADMIN (acceso total — el middleware lo bypasea, pero se registra para consistencia)
('admin','dashboard',    TRUE, FALSE,FALSE,FALSE),
('admin','productos',    TRUE, TRUE, TRUE, TRUE),
('admin','categorias',   TRUE, TRUE, TRUE, TRUE),
('admin','subcategorias',TRUE, TRUE, TRUE, TRUE),
('admin','movimientos',  TRUE, TRUE, TRUE, TRUE),
('admin','historial',    TRUE, FALSE,FALSE,FALSE),
('admin','ubicaciones',  TRUE, TRUE, TRUE, TRUE),
('admin','reportes',     TRUE, TRUE, FALSE,FALSE),
('admin','usuarios',     TRUE, TRUE, TRUE, TRUE),
('admin','auditoria',    TRUE, FALSE,FALSE,FALSE),
('admin','importar',     TRUE, TRUE, FALSE,FALSE),
-- SUPERVISOR
('supervisor','dashboard',    TRUE, FALSE,FALSE,FALSE),
('supervisor','productos',    TRUE, TRUE, TRUE, FALSE),
('supervisor','categorias',   TRUE, TRUE, TRUE, FALSE),
('supervisor','subcategorias',TRUE, TRUE, TRUE, FALSE),
('supervisor','movimientos',  TRUE, TRUE, TRUE, FALSE),
('supervisor','historial',    TRUE, FALSE,FALSE,FALSE),
('supervisor','ubicaciones',  TRUE, TRUE, TRUE, FALSE),
('supervisor','reportes',     TRUE, TRUE, FALSE,FALSE),
('supervisor','usuarios',     TRUE, FALSE,FALSE,FALSE),
('supervisor','auditoria',    TRUE, FALSE,FALSE,FALSE),
('supervisor','importar',     TRUE, TRUE, FALSE,FALSE),
-- OPERARIO
('operario','dashboard',    TRUE, FALSE,FALSE,FALSE),
('operario','productos',    TRUE, FALSE,FALSE,FALSE),
('operario','categorias',   FALSE,FALSE,FALSE,FALSE),
('operario','subcategorias',FALSE,FALSE,FALSE,FALSE),
('operario','movimientos',  TRUE, TRUE, FALSE,FALSE),
('operario','historial',    TRUE, FALSE,FALSE,FALSE),
('operario','ubicaciones',  TRUE, TRUE, TRUE, FALSE),
('operario','reportes',     FALSE,FALSE,FALSE,FALSE),
('operario','usuarios',     FALSE,FALSE,FALSE,FALSE),
('operario','auditoria',    FALSE,FALSE,FALSE,FALSE),
('operario','importar',     FALSE,FALSE,FALSE,FALSE)
ON DUPLICATE KEY UPDATE
  puede_ver      = VALUES(puede_ver),
  puede_crear    = VALUES(puede_crear),
  puede_editar   = VALUES(puede_editar),
  puede_eliminar = VALUES(puede_eliminar);

-- ============================================================
-- PASO 10: Subcategorías base (si la tabla está vacía)
-- ============================================================
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Manuales' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Eléctricas portátiles' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Medición' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Neumáticas' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Especializadas' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Generadores' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Compresores y bombas' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Andamios y escaleras' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Soldadura' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Maquinaria ligera' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Cables y conductores' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Interruptores y breakers' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Tomacorrientes' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Canalización' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Iluminación' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Tubería' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Conexiones y codos' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Llaves y válvulas' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Selladores' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Accesorios sanitarios' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Motores y bombas' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Rodamientos y bandas' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Filtros' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Sensores y controles' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Piezas por equipo' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Lubricantes y grasas' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Desengrasantes' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Pinturas' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Adhesivos industriales' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Abrasivos' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Cascos y barbijos' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Guantes' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Lentes y caretas' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Calzado de seguridad' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Arnés y línea de vida' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Cemento y agregados' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Bloques y ladrillos' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Varilla y malla' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Impermeabilizantes' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Ferretería estructural' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Embalaje' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Etiquetas' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Papelería' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Contenedores' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Limpieza de área' FROM categorias WHERE nombre = 'Consumibles de Almacén';

-- ============================================================
-- FIN DEL SCRIPT
-- Ejecutar a continuación: node scripts/setupUsuarios.js
-- ============================================================
SELECT 'FIX COMPLETO v2 APLICADO CORRECTAMENTE' AS resultado;

-- ============================================================
-- PASO 1: Columnas faltantes en tablas base (add_mejoras_v2.sql)
-- Usamos IF NOT EXISTS vía information_schema para MySQL 5.7+
-- ============================================================

SET @dbname = DATABASE();

-- productos.activo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'productos' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE productos ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER unidad_medida',
  'SELECT "productos.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- categorias.activo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'categorias' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE categorias ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER descripcion',
  'SELECT "categorias.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- usuarios.activo
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'usuarios' AND column_name = 'activo');
SET @sql = IF(@col = 0,
  'ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER rol',
  'SELECT "usuarios.activo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- usuarios.username
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'usuarios' AND column_name = 'username');
SET @sql = IF(@col = 0,
  'ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) NULL UNIQUE AFTER nombre',
  'SELECT "usuarios.username ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Poblar username desde email si está vacío
UPDATE usuarios SET username = SUBSTRING_INDEX(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- movimientos.id_movimiento_origen
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND column_name = 'id_movimiento_origen');
SET @sql = IF(@col = 0,
  'ALTER TABLE movimientos ADD COLUMN id_movimiento_origen INT NULL AFTER id_orden_trabajo',
  'SELECT "movimientos.id_movimiento_origen ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- productos.id_subcategoria
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'productos' AND column_name = 'id_subcategoria');
SET @sql = IF(@col = 0,
  'ALTER TABLE productos ADD COLUMN id_subcategoria INT NULL AFTER id_categoria',
  'SELECT "productos.id_subcategoria ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 2: Tabla subcategorias (si no existe)
-- ============================================================
CREATE TABLE IF NOT EXISTS subcategorias (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria  INT NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_subcat_cat_nombre (id_categoria, nombre)
);

-- FK de productos → subcategorias (si no existe)
SET @fk = (SELECT COUNT(*) FROM information_schema.key_column_usage
  WHERE table_schema = @dbname AND table_name = 'productos'
  AND constraint_name = 'fk_producto_subcategoria');
SET @sql = IF(@fk = 0,
  'ALTER TABLE productos ADD CONSTRAINT fk_producto_subcategoria FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id) ON DELETE SET NULL',
  'SELECT "FK fk_producto_subcategoria ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 3: Tabla permisos
-- ============================================================
CREATE TABLE IF NOT EXISTS permisos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  rol            ENUM('admin','supervisor','operario') NOT NULL,
  modulo         VARCHAR(50) NOT NULL,
  puede_ver      BOOLEAN DEFAULT FALSE,
  puede_crear    BOOLEAN DEFAULT FALSE,
  puede_editar   BOOLEAN DEFAULT FALSE,
  puede_eliminar BOOLEAN DEFAULT FALSE,
  UNIQUE KEY uk_rol_modulo (rol, modulo)
);

-- ============================================================
-- PASO 4: Tabla permisos_usuario (overrides individuales)
-- ============================================================
CREATE TABLE IF NOT EXISTS permisos_usuario (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario     INT NOT NULL,
  modulo         VARCHAR(50) NOT NULL,
  puede_ver      BOOLEAN NOT NULL DEFAULT FALSE,
  puede_crear    BOOLEAN NOT NULL DEFAULT FALSE,
  puede_editar   BOOLEAN NOT NULL DEFAULT FALSE,
  puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
  asignado_por   INT NULL,
  motivo         VARCHAR(255) NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuario_modulo (id_usuario, modulo),
  FOREIGN KEY (id_usuario)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================
-- PASO 5: Tabla auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario      INT NULL,
  usuario_nombre  VARCHAR(100),
  usuario_email   VARCHAR(150),
  usuario_rol     VARCHAR(20),
  accion          ENUM(
    'LOGIN','LOGIN_FALLIDO','LOGOUT',
    'CREAR','EDITAR','ELIMINAR',
    'REGISTRAR_MOVIMIENTO','CAMBIAR_PASSWORD','CERRAR_UBICACION'
  ) NOT NULL,
  modulo          VARCHAR(50) NOT NULL,
  entidad_id      INT NULL,
  entidad_nombre  VARCHAR(200),
  detalle         JSON NULL,
  ip              VARCHAR(45),
  user_agent      VARCHAR(255),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_aud_fecha    (fecha),
  INDEX idx_aud_modulo   (modulo),
  INDEX idx_aud_usuario  (id_usuario),
  INDEX idx_aud_accion   (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PASO 6: Tabla sesiones_invalidas (para invalidar JWT en logout)
-- ============================================================
CREATE TABLE IF NOT EXISTS sesiones_invalidas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  id_usuario INT NOT NULL,
  fecha_exp  TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_fecha_exp  (fecha_exp)
);

-- Migración: renombrar columna 'token' → 'token_hash' si existe la vieja
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = 'sesiones_invalidas' AND column_name = 'token');
SET @sql = IF(@col = 1,
  'ALTER TABLE sesiones_invalidas DROP COLUMN token',
  'SELECT "columna token ya eliminada"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 7: Tabla ubicaciones_material
-- ============================================================
CREATE TABLE IF NOT EXISTS ubicaciones_material (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  id_movimiento     INT NOT NULL,
  id_producto       INT NOT NULL,
  id_tecnico        INT NOT NULL,
  ubicacion         VARCHAR(200) NOT NULL,
  motivo            VARCHAR(200) NOT NULL,
  descripcion       TEXT,
  estado            ENUM('EN_USO','EN_OBRA','PENDIENTE_DEV','EXTRAVIADO','DEVUELTO') NOT NULL DEFAULT 'EN_USO',
  fecha_esperada_dev DATE NULL,
  fecha_devolucion   TIMESTAMP NULL,
  id_reportado_por  INT NOT NULL,
  id_cerrado_por    INT NULL,
  nota_cierre       TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_movimiento)    REFERENCES movimientos(id)  ON DELETE RESTRICT,
  FOREIGN KEY (id_producto)      REFERENCES productos(id)    ON DELETE RESTRICT,
  FOREIGN KEY (id_tecnico)       REFERENCES usuarios(id)     ON DELETE RESTRICT,
  FOREIGN KEY (id_reportado_por) REFERENCES usuarios(id)     ON DELETE RESTRICT,
  FOREIGN KEY (id_cerrado_por)   REFERENCES usuarios(id)     ON DELETE SET NULL,
  INDEX idx_movimiento (id_movimiento)
);

-- Índices adicionales para ubicaciones_material
SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'ubicaciones_material' AND index_name = 'idx_ub_tecnico');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_ub_tecnico ON ubicaciones_material (id_tecnico)',
  'SELECT "idx_ub_tecnico ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'ubicaciones_material' AND index_name = 'idx_ub_estado');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_ub_estado ON ubicaciones_material (estado)',
  'SELECT "idx_ub_estado ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'ubicaciones_material' AND index_name = 'idx_fecha_esperada_dev');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_fecha_esperada_dev ON ubicaciones_material (fecha_esperada_dev)',
  'SELECT "idx_fecha_esperada_dev ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 8: Índices de optimización en movimientos y productos
-- ============================================================
SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_tipo');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_movimientos_tipo ON movimientos(tipo)',
  'SELECT "idx_movimientos_tipo ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_fecha');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_movimientos_fecha ON movimientos(fecha)',
  'SELECT "idx_movimientos_fecha ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_tecnico');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_movimientos_tecnico ON movimientos(id_tecnico)',
  'SELECT "idx_movimientos_tecnico ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'productos' AND index_name = 'idx_productos_categoria');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_productos_categoria ON productos(id_categoria)',
  'SELECT "idx_productos_categoria ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'productos' AND index_name = 'idx_productos_stock');
SET @sql = IF(@idx = 0,
  'CREATE INDEX idx_productos_stock ON productos(stock_actual)',
  'SELECT "idx_productos_stock ya existe"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- PASO 9: Datos iniciales de permisos por rol
-- ============================================================
INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES
('admin','dashboard',TRUE,FALSE,FALSE,FALSE),
('admin','productos',TRUE,TRUE,TRUE,TRUE),
('admin','categorias',TRUE,TRUE,TRUE,TRUE),
('admin','subcategorias',TRUE,TRUE,TRUE,TRUE),
('admin','movimientos',TRUE,TRUE,TRUE,TRUE),
('admin','historial',TRUE,FALSE,FALSE,FALSE),
('admin','ubicaciones',TRUE,TRUE,TRUE,TRUE),
('admin','reportes',TRUE,TRUE,FALSE,FALSE),
('admin','usuarios',TRUE,TRUE,TRUE,TRUE),
('admin','auditoria',TRUE,FALSE,FALSE,FALSE),
('admin','importar',TRUE,TRUE,FALSE,FALSE),
('supervisor','dashboard',TRUE,FALSE,FALSE,FALSE),
('supervisor','productos',TRUE,TRUE,TRUE,FALSE),
('supervisor','categorias',TRUE,TRUE,TRUE,FALSE),
('supervisor','subcategorias',TRUE,TRUE,TRUE,FALSE),
('supervisor','movimientos',TRUE,TRUE,TRUE,FALSE),
('supervisor','historial',TRUE,FALSE,FALSE,FALSE),
('supervisor','ubicaciones',TRUE,TRUE,TRUE,FALSE),
('supervisor','reportes',TRUE,TRUE,FALSE,FALSE),
('supervisor','usuarios',TRUE,FALSE,FALSE,FALSE),
('supervisor','auditoria',TRUE,FALSE,FALSE,FALSE),
('supervisor','importar',TRUE,TRUE,FALSE,FALSE),
('operario','dashboard',TRUE,FALSE,FALSE,FALSE),
('operario','productos',TRUE,FALSE,FALSE,FALSE),
('operario','categorias',FALSE,FALSE,FALSE,FALSE),
('operario','subcategorias',FALSE,FALSE,FALSE,FALSE),
('operario','movimientos',TRUE,TRUE,FALSE,FALSE),
('operario','historial',TRUE,FALSE,FALSE,FALSE),
('operario','ubicaciones',TRUE,TRUE,TRUE,FALSE),
('operario','reportes',FALSE,FALSE,FALSE,FALSE),
('operario','usuarios',FALSE,FALSE,FALSE,FALSE),
('operario','auditoria',FALSE,FALSE,FALSE,FALSE),
('operario','importar',FALSE,FALSE,FALSE,FALSE)
ON DUPLICATE KEY UPDATE
  puede_ver=VALUES(puede_ver), puede_crear=VALUES(puede_crear),
  puede_editar=VALUES(puede_editar), puede_eliminar=VALUES(puede_eliminar);

-- ============================================================
-- PASO 10: Subcategorías base (si la tabla está vacía)
-- ============================================================
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Manuales' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Eléctricas portátiles' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Medición' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Neumáticas' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Especializadas' FROM categorias WHERE nombre = 'Herramientas';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Generadores' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Compresores y bombas' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Andamios y escaleras' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Soldadura' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Maquinaria ligera' FROM categorias WHERE nombre = 'Equipos y Maquinaria';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Cables y conductores' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Interruptores y breakers' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Tomacorrientes' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Canalización' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Iluminación' FROM categorias WHERE nombre = 'Materiales Eléctricos';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Tubería' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Conexiones y codos' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Llaves y válvulas' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Selladores' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Accesorios sanitarios' FROM categorias WHERE nombre = 'Materiales de Plomería';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Motores y bombas' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Rodamientos y bandas' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Filtros' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Sensores y controles' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Piezas por equipo' FROM categorias WHERE nombre = 'Repuestos y Componentes';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Lubricantes y grasas' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Desengrasantes' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Pinturas' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Adhesivos industriales' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Abrasivos' FROM categorias WHERE nombre = 'Insumos de Mantenimiento';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Cascos y barbijos' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Guantes' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Lentes y caretas' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Calzado de seguridad' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Arnés y línea de vida' FROM categorias WHERE nombre = 'EPP';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Cemento y agregados' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Bloques y ladrillos' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Varilla y malla' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Impermeabilizantes' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Ferretería estructural' FROM categorias WHERE nombre = 'Materiales de Construcción';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Embalaje' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Etiquetas' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Papelería' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Contenedores' FROM categorias WHERE nombre = 'Consumibles de Almacén';
INSERT IGNORE INTO subcategorias (id_categoria, nombre)
SELECT id, 'Limpieza de área' FROM categorias WHERE nombre = 'Consumibles de Almacén';

-- ============================================================
-- FIN DEL SCRIPT
-- Ejecutar a continuación: node scripts/setupUsuarios.js
-- ============================================================
SELECT 'FIX COMPLETO APLICADO CORRECTAMENTE' AS resultado;
