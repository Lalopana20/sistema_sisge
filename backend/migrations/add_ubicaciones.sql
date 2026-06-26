-- ============================================================
--  Migración: sistema de ubicaciones y alertas de material
--  Ejecutar una sola vez en sisge_almacen
-- ============================================================

-- ------------------------------------------------------------
-- UBICACIONES DE MATERIAL
-- Registra dónde está un ítem despachado que no ha sido devuelto.
-- Cada registro está vinculado a un movimiento de SALIDA.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ubicaciones_material (
  id                INT AUTO_INCREMENT PRIMARY KEY,

  -- Movimiento de SALIDA al que corresponde esta ubicación
  id_movimiento     INT NOT NULL,

  -- Producto y técnico (desnormalizados para consulta rápida)
  id_producto       INT NOT NULL,
  id_tecnico        INT NOT NULL,

  -- Dónde está el material
  ubicacion         VARCHAR(200) NOT NULL,          -- "Obra Av. Principal #45", "Taller Norte"
  motivo            VARCHAR(200) NOT NULL,           -- "Instalación en curso", "Reparación pendiente"
  descripcion       TEXT,                            -- detalle libre

  -- Estado del ítem
  estado            ENUM(
                      'EN_USO',        -- técnico lo tiene activo
                      'EN_OBRA',       -- dejado en obra/sitio
                      'PENDIENTE_DEV', -- debe devolverse pronto
                      'EXTRAVIADO',    -- no se sabe dónde está
                      'DEVUELTO'       -- ya fue devuelto (cerrado)
                    ) NOT NULL DEFAULT 'EN_USO',

  -- Fechas de control
  fecha_esperada_dev DATE NULL,                      -- cuándo se espera la devolución
  fecha_devolucion   TIMESTAMP NULL,                 -- cuándo se registró la devolución real

  -- Quién reportó la ubicación
  id_reportado_por  INT NOT NULL,                    -- usuario que creó el registro
  id_cerrado_por    INT NULL,                        -- usuario que marcó como DEVUELTO

  -- Notas de cierre
  nota_cierre       TEXT,

  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (id_movimiento)    REFERENCES movimientos(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_producto)      REFERENCES productos(id)   ON DELETE RESTRICT,
  FOREIGN KEY (id_tecnico)       REFERENCES usuarios(id)    ON DELETE RESTRICT,
  FOREIGN KEY (id_reportado_por) REFERENCES usuarios(id)    ON DELETE RESTRICT,
  FOREIGN KEY (id_cerrado_por)   REFERENCES usuarios(id)    ON DELETE SET NULL,

  -- Permitir re-crear ubicación para un movimiento si la anterior fue DEVUELTA
  -- La validación se hace en codigo (ubicacionService.js) en lugar de BD
  INDEX idx_movimiento (id_movimiento)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_ub_tecnico  ON ubicaciones_material (id_tecnico);
CREATE INDEX idx_ub_estado   ON ubicaciones_material (estado);
CREATE INDEX idx_ub_producto ON ubicaciones_material (id_producto);
