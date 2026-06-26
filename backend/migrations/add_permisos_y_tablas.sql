-- ============================================================
-- SISGE - Tablas faltantes y sistema de permisos
-- ============================================================

USE sisge_almacen;

-- ------------------------------------------------------------
-- TABLA: permisos (define qué puede hacer cada rol)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permisos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  rol         ENUM('admin','supervisor','operario') NOT NULL,
  modulo      VARCHAR(50) NOT NULL,  -- dashboard, productos, categorias, movimientos, etc.
  puede_ver   BOOLEAN DEFAULT FALSE,
  puede_crear BOOLEAN DEFAULT FALSE,
  puede_editar BOOLEAN DEFAULT FALSE,
  puede_eliminar BOOLEAN DEFAULT FALSE,
  UNIQUE KEY uk_rol_modulo (rol, modulo)
);

-- ------------------------------------------------------------
-- TABLA: auditoria (registro de todas las acciones)
-- Tabla creada con esquema completo, compatible con setupAuditoria.js
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario      INT NULL,
  usuario_nombre  VARCHAR(100),
  usuario_email   VARCHAR(150),
  usuario_rol     VARCHAR(20),
  accion          ENUM(
    'LOGIN', 'LOGIN_FALLIDO', 'LOGOUT',
    'CREAR', 'EDITAR', 'ELIMINAR',
    'REGISTRAR_MOVIMIENTO', 'CAMBIAR_PASSWORD', 'CERRAR_UBICACION'
  ) NOT NULL,
  modulo          VARCHAR(50) NOT NULL,
  entidad_id      INT NULL,
  entidad_nombre  VARCHAR(200),
  detalle         JSON NULL,
  ip              VARCHAR(45),
  user_agent      VARCHAR(255),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_aud_fecha (fecha),
  INDEX idx_aud_modulo (modulo),
  INDEX idx_aud_usuario (id_usuario),
  INDEX idx_aud_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: ubicaciones_material se crea en migrations/add_ubicaciones.sql
-- (esquema más completo con descripcion, id_reportado_por, etc.)
-- No duplicar aquí para evitar conflictos de schema.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- TABLA: proveedores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedores (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  ruc         VARCHAR(20) UNIQUE,
  contacto    VARCHAR(100),
  telefono    VARCHAR(20),
  email       VARCHAR(100),
  direccion   TEXT,
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TABLA: ordenes_compra
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  numero_oc       VARCHAR(50) NOT NULL UNIQUE,
  id_proveedor    INT NOT NULL,
  fecha_emision   DATE NOT NULL,
  fecha_entrega   DATE,
  estado          ENUM('PENDIENTE','RECIBIDA','PARCIAL','CANCELADA') DEFAULT 'PENDIENTE',
  total           DECIMAL(12,2),
  observaciones   TEXT,
  id_usuario      INT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_usuario)   REFERENCES usuarios(id)   ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- TABLA: ordenes_compra_detalle
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordenes_compra_detalle (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  id_orden_compra INT NOT NULL,
  id_producto     INT NOT NULL,
  cantidad        DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2),
  subtotal        DECIMAL(12,2),
  FOREIGN KEY (id_orden_compra) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  FOREIGN KEY (id_producto)     REFERENCES productos(id)      ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- TABLA: ordenes_trabajo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  numero_ot       VARCHAR(50) NOT NULL UNIQUE,
  titulo          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  id_tecnico      INT,
  cliente         VARCHAR(150),
  ubicacion       VARCHAR(200),
  fecha_inicio    DATE,
  fecha_fin       DATE,
  estado          ENUM('PENDIENTE','EN_PROCESO','COMPLETADA','CANCELADA') DEFAULT 'PENDIENTE',
  prioridad       ENUM('BAJA','MEDIA','ALTA','URGENTE') DEFAULT 'MEDIA',
  id_usuario      INT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tecnico)  REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (id_usuario)  REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- TABLA: configuracion_usuario (preferencias de apariencia)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_usuario (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL UNIQUE,
  tema_oscuro     BOOLEAN DEFAULT FALSE,
  color_primario  VARCHAR(7) DEFAULT '#1890ff',
  color_sidebar   VARCHAR(7) DEFAULT '#001529',
  tamano_fuente   INT DEFAULT 14,
  modo_compacto   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- TABLA: notificaciones
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario  INT NOT NULL,
  tipo        ENUM('INFO','ADVERTENCIA','ERROR','EXITO') DEFAULT 'INFO',
  titulo      VARCHAR(150) NOT NULL,
  mensaje     TEXT,
  leida       BOOLEAN DEFAULT FALSE,
  url         VARCHAR(200),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_leida (id_usuario, leida)
);

-- ------------------------------------------------------------
-- TABLA: precios_producto (historial de costos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS precios_producto (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  fecha_desde DATE NOT NULL,
  fecha_hasta DATE,
  activo      BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_producto_activo (id_producto, activo)
);

-- ------------------------------------------------------------
-- TABLA: sesiones_invalidas (para invalidar JWT)
-- token_hash: SHA-256 del token para busqueda eficiente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sesiones_invalidas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  id_usuario INT NOT NULL,
  fecha_exp  TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_fecha_exp (fecha_exp)
);

-- Migración para BD existentes: agregar columna token_hash si no existe
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'sesiones_invalidas' AND column_name = 'token_hash');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE sesiones_invalidas ADD COLUMN token_hash VARCHAR(64) UNIQUE AFTER id', 'SELECT ''token_hash ya existe''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'sesiones_invalidas' AND column_name = 'token');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE sesiones_invalidas DROP COLUMN token', 'SELECT ''token ya eliminado''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- DATOS INICIALES: PERMISOS POR ROL
-- ============================================================

-- Permisos para ADMIN (acceso total)
INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES
('admin', 'dashboard',     TRUE, FALSE, FALSE, FALSE),
('admin', 'productos',     TRUE, TRUE,  TRUE,  TRUE),
('admin', 'categorias',    TRUE, TRUE,  TRUE,  TRUE),
('admin', 'subcategorias', TRUE, TRUE,  TRUE,  TRUE),
('admin', 'movimientos',   TRUE, TRUE,  TRUE,  TRUE),
('admin', 'historial',     TRUE, FALSE, FALSE, FALSE),
('admin', 'ubicaciones',   TRUE, TRUE,  TRUE,  TRUE),
('admin', 'reportes',      TRUE, TRUE,  FALSE, FALSE),
('admin', 'usuarios',      TRUE, TRUE,  TRUE,  TRUE),
('admin', 'auditoria',     TRUE, FALSE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE puede_ver=VALUES(puede_ver), puede_crear=VALUES(puede_crear), 
                        puede_editar=VALUES(puede_editar), puede_eliminar=VALUES(puede_eliminar);

-- Permisos para SUPERVISOR (acceso intermedio)
INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES
('supervisor', 'dashboard',     TRUE, FALSE, FALSE, FALSE),
('supervisor', 'productos',     TRUE, TRUE,  TRUE,  FALSE),
('supervisor', 'categorias',    TRUE, TRUE,  TRUE,  FALSE),
('supervisor', 'subcategorias', TRUE, TRUE,  TRUE,  FALSE),
('supervisor', 'movimientos',   TRUE, TRUE,  TRUE,  FALSE),
('supervisor', 'historial',     TRUE, FALSE, FALSE, FALSE),
('supervisor', 'ubicaciones',   TRUE, TRUE,  TRUE,  FALSE),
('supervisor', 'reportes',      TRUE, TRUE,  FALSE, FALSE),
('supervisor', 'usuarios',      TRUE, FALSE, FALSE, FALSE),
('supervisor', 'auditoria',     TRUE, FALSE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE puede_ver=VALUES(puede_ver), puede_crear=VALUES(puede_crear), 
                        puede_editar=VALUES(puede_editar), puede_eliminar=VALUES(puede_eliminar);

-- Permisos para OPERARIO/TÉCNICO (acceso limitado - solo consulta y registro de movimientos)
INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES
('operario', 'dashboard',     TRUE,  FALSE, FALSE, FALSE),
('operario', 'productos',     TRUE,  FALSE, FALSE, FALSE),  -- Solo consulta
('operario', 'categorias',    FALSE, FALSE, FALSE, FALSE),  -- No acceso
('operario', 'subcategorias', FALSE, FALSE, FALSE, FALSE),  -- No acceso
('operario', 'movimientos',   TRUE,  TRUE,  FALSE, FALSE),  -- Puede registrar salidas/devoluciones
('operario', 'historial',     TRUE,  FALSE, FALSE, FALSE),  -- Solo ver su historial
('operario', 'ubicaciones',   TRUE,  TRUE,  TRUE,  FALSE),  -- Puede actualizar ubicaciones
('operario', 'reportes',      FALSE, FALSE, FALSE, FALSE),  -- No acceso
('operario', 'usuarios',      FALSE, FALSE, FALSE, FALSE),  -- No acceso
('operario', 'auditoria',     FALSE, FALSE, FALSE, FALSE)   -- No acceso
ON DUPLICATE KEY UPDATE puede_ver=VALUES(puede_ver), puede_crear=VALUES(puede_crear), 
                        puede_editar=VALUES(puede_editar), puede_eliminar=VALUES(puede_eliminar);

-- ============================================================
-- DATOS INICIALES: PROVEEDORES
-- ============================================================
INSERT INTO proveedores (nombre, ruc, contacto, telefono, email) VALUES
('Ferretería El Tornillo SAC',     '20123456789', 'Juan Pérez',    '987654321', 'ventas@eltornillo.com'),
('Distribuidora Eléctrica Norte',  '20234567890', 'María García',  '987654322', 'contacto@electricanorte.com'),
('Suministros Industriales SAC',   '20345678901', 'Carlos López',  '987654323', 'ventas@suministros.com'),
('Importadora de Herramientas',    '20456789012', 'Ana Martínez',  '987654324', 'info@importadora.com'),
('Materiales de Construcción SAC', '20567890123', 'Pedro Sánchez', '987654325', 'ventas@materiales.com'),
('EPP Seguridad Industrial',       '20678901234', 'Laura Torres',  '987654326', 'contacto@eppseguridad.com'),
('Repuestos Técnicos SAC',         '20789012345', 'Miguel Rojas',  '987654327', 'ventas@repuestos.com'),
('Lubricantes y Químicos SAC',     '20890123456', 'Rosa Flores',   '987654328', 'info@lubricantes.com')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ============================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================================
-- CREATE INDEX IF NOT EXISTS no es soportado en MySQL 5.7 (XAMPP típico)
-- Usamos CREATE INDEX con verificacion explicita
SET @dbname = DATABASE();
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_tipo');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_movimientos_tipo ON movimientos(tipo)', 'SELECT ''idx_movimientos_tipo ya existe''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_fecha');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_movimientos_fecha ON movimientos(fecha)', 'SELECT ''idx_movimientos_fecha ya existe''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'movimientos' AND index_name = 'idx_movimientos_tecnico');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_movimientos_tecnico ON movimientos(id_tecnico)', 'SELECT ''idx_movimientos_tecnico ya existe''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'productos' AND index_name = 'idx_productos_categoria');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_productos_categoria ON productos(id_categoria)', 'SELECT ''idx_productos_categoria ya existe''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'productos' AND index_name = 'idx_productos_stock');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_productos_stock ON productos(stock_actual)', 'SELECT ''idx_productos_stock ya existe''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

