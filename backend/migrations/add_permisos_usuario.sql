-- ============================================================
--  SISGE — Permisos individuales por usuario
--  Ejecutar UNA VEZ en phpMyAdmin sobre sisge_almacen
-- ============================================================

USE sisge_almacen;

-- ------------------------------------------------------------
-- TABLA: permisos_usuario
-- Permite sobreescribir los permisos del rol para un usuario
-- específico. Cada fila es un "override" del permiso del rol.
--
-- IMPORTANTE: Los valores NULL indican "heredar del rol"
--   - NULL      → usar permiso del rol (heredar)
--   - TRUE      → permiso explícitamente concedido
--   - FALSE     → permiso explícitamente denegado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permisos_usuario (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  modulo          VARCHAR(50) NOT NULL,
  puede_ver       BOOLEAN NULL DEFAULT NULL,
  puede_crear     BOOLEAN NULL DEFAULT NULL,
  puede_editar    BOOLEAN NULL DEFAULT NULL,
  puede_eliminar  BOOLEAN NULL DEFAULT NULL,
  -- Quién asignó este permiso y cuándo
  asignado_por    INT NULL,
  motivo          VARCHAR(200) NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuario_modulo (id_usuario, modulo),
  FOREIGN KEY (id_usuario)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_pu_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Tabla permisos_usuario creada correctamente' AS resultado;
