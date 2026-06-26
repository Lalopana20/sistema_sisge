-- ============================================================
--  SISGE — Datos de ejemplo para desarrollo y demostración
--  Ejecutar DESPUÉS de sisge_almacen.sql y add_ubicaciones.sql
-- ============================================================

USE sisge_almacen;

-- ============================================================
-- PRODUCTOS (60 productos distribuidos en las 9 categorías)
-- ============================================================
INSERT INTO productos (nombre, descripcion, id_categoria, id_subcategoria, stock_actual, stock_minimo, unidad_medida) VALUES

-- Herramientas / Manuales
('Martillo de carpintero 16oz',   'Mango de fibra de vidrio, cabeza de acero',          1, 1,  8,  3, 'unidad'),
('Destornillador Phillips #2',    'Punta magnética, mango ergonómico',                  1, 1, 15,  5, 'unidad'),
('Llave ajustable 12"',           'Acero cromo-vanadio, apertura máx 35mm',             1, 1,  6,  2, 'unidad'),
('Alicate de corte diagonal',     'Corte limpio hasta calibre 10 AWG',                  1, 1, 10,  4, 'unidad'),
('Cinta métrica 5m',              'Cuerpo ABS, cinta de acero inoxidable',              1, 3, 12,  4, 'unidad'),

-- Herramientas / Eléctricas portátiles
('Taladro percutor 13mm 750W',    'Velocidad variable, reversa, maletín incluido',      1, 2,  4,  2, 'unidad'),
('Amoladora angular 4.5" 850W',   'Disco de desbaste incluido, protector ajustable',   1, 2,  3,  1, 'unidad'),
('Sierra circular 7.25" 1400W',   'Guía paralela, hoja de 24 dientes',                 1, 2,  2,  1, 'unidad'),

-- Herramientas / Medición
('Nivel de burbuja 60cm',         'Aluminio extruido, 3 burbujas',                      1, 3,  7,  2, 'unidad'),
('Multímetro digital UNI-T',      'Voltaje, corriente, resistencia, continuidad',       1, 3,  5,  2, 'unidad'),
('Detector de voltaje sin contacto','Rango 12-1000V AC, señal sonora y visual',         1, 3,  8,  3, 'unidad'),

-- Equipos y Maquinaria / Generadores
('Generador 5500W gasolina',      'Motor 4T 389cc, AVR, panel de control',              2, 6,  2,  1, 'unidad'),
('Generador inverter 2200W',      'Silencioso, portátil, arranque eléctrico',           2, 6,  1,  1, 'unidad'),

-- Equipos y Maquinaria / Compresores
('Compresor de aire 50L 2HP',     'Presión máx 115 PSI, motor monofásico',              2, 7,  2,  1, 'unidad'),
('Bomba de agua 1HP centrífuga',  'Caudal 60 L/min, cabeza máx 35m',                   2, 7,  3,  1, 'unidad'),

-- Equipos y Maquinaria / Andamios
('Andamio tubular 1.5x1m',        'Tubo galvanizado 1.5", plataforma incluida',         2, 8,  6,  2, 'unidad'),
('Escalera telescópica 6m',       'Aluminio, 12 peldaños, carga máx 150kg',             2, 8,  3,  1, 'unidad'),

-- Materiales Eléctricos / Cables
('Cable THW 12 AWG negro x100m',  'Cobre sólido, aislamiento PVC 600V',                3, 11, 5,  2, 'rollo'),
('Cable THW 10 AWG rojo x100m',   'Cobre sólido, aislamiento PVC 600V',                3, 11, 4,  2, 'rollo'),
('Cable encauchetado 3x12 x50m',  'Flexible, uso industrial, 600V',                    3, 11, 3,  1, 'rollo'),
('Cable UTP Cat6 x305m',          'Caja 305m, 4 pares, CMR rated',                     3, 11, 2,  1, 'caja'),

-- Materiales Eléctricos / Interruptores
('Breaker 1P 20A Schneider',      'Riel DIN, curva C, 6kA',                            3, 12, 20, 5, 'unidad'),
('Breaker 2P 30A Schneider',      'Riel DIN, curva C, 6kA',                            3, 12, 12, 3, 'unidad'),
('Breaker 3P 60A Schneider',      'Riel DIN, curva C, 10kA',                           3, 12,  8, 2, 'unidad'),
('Interruptor diferencial 2P 25A','30mA, clase AC, riel DIN',                          3, 12,  6, 2, 'unidad'),

-- Materiales Eléctricos / Canalización
('Conduit EMT 3/4" x3m',          'Acero galvanizado, extremos lisos',                 3, 14, 30, 10, 'unidad'),
('Conduit PVC 3/4" x3m',          'Rígido, gris, UL listed',                           3, 14, 25,  8, 'unidad'),
('Canaleta ranurada 40x25mm x2m', 'PVC blanco, tapa incluida',                         3, 14, 20,  5, 'unidad'),

-- Materiales Eléctricos / Iluminación
('Luminaria LED 40W panel',       'Empotrable 60x60cm, 4000K, 3600lm',                 3, 15, 10,  3, 'unidad'),
('Reflector LED 100W exterior',   'IP65, 6500K, soporte ajustable',                    3, 15,  6,  2, 'unidad'),
('Lámpara LED T8 18W x1.2m',      'Tubo fluorescente LED, 6500K, 1800lm',              3, 15, 24,  6, 'unidad'),

-- Materiales de Plomería / Tubería
('Tubo PVC 1/2" x6m',             'Presión, roscable, ASTM D1785',                     4, 16, 20,  5, 'unidad'),
('Tubo PVC 3/4" x6m',             'Presión, roscable, ASTM D1785',                     4, 16, 15,  4, 'unidad'),
('Tubo CPVC 1/2" x6m',            'Agua caliente, SDR-11, 100 PSI',                    4, 16, 10,  3, 'unidad'),
('Tubo galvanizado 1" x6m',       'Cédula 40, extremos roscados',                      4, 16,  8,  2, 'unidad'),

-- Materiales de Plomería / Conexiones
('Codo PVC 1/2" 90°',             'Presión, socket, bolsa x10',                        4, 17, 50, 15, 'unidad'),
('Tee PVC 3/4"',                  'Presión, socket, bolsa x5',                         4, 17, 30, 10, 'unidad'),
('Unión universal PVC 1/2"',      'Desmontable, presión',                              4, 17, 20,  5, 'unidad'),

-- Repuestos y Componentes / Rodamientos
('Rodamiento 6205 2RS',           '25x52x15mm, sellado, SKF',                          5, 22, 10,  3, 'unidad'),
('Rodamiento 6208 ZZ',            '40x80x18mm, blindado, FAG',                         5, 22,  8,  2, 'unidad'),
('Correa en V tipo A-50',         'Neopreno, longitud exterior 1295mm',                5, 22,  6,  2, 'unidad'),

-- Repuestos y Componentes / Filtros
('Filtro de aceite Fram PH3600',  'Rosca 3/4-16 UNF, bypass 11 PSI',                  5, 23, 12,  4, 'unidad'),
('Filtro de aire 17801-0C010',    'Panel, papel, Toyota Hilux',                        5, 23,  8,  2, 'unidad'),
('Filtro hidráulico HF6553',      'Spin-on, 10 micras, 3000 PSI',                      5, 23,  6,  2, 'unidad'),

-- Insumos de Mantenimiento / Lubricantes
('Aceite hidráulico ISO 46 x20L', 'Antidesgaste, antioxidante, antiespumante',         6, 26,  8,  2, 'unidad'),
('Grasa multipropósito NLGI 2 x1kg','Base litio, rango -20°C a 130°C',                6, 26, 15,  4, 'unidad'),
('Aceite de motor 15W40 x4L',     'Mineral, API CF-4, para diésel',                   6, 26, 10,  3, 'unidad'),
('WD-40 lubricante x400ml',       'Desplaza humedad, afloja piezas oxidadas',          6, 27,  8,  3, 'unidad'),

-- EPP / Cascos
('Casco de seguridad clase E',    'HDPE, ranura para accesorios, blanco',              7, 31, 10,  4, 'unidad'),
('Casco con rachet ajustable',    'ABS, suspensión de 6 puntos, amarillo',             7, 31,  8,  3, 'unidad'),

-- EPP / Guantes
('Guantes de cuero soldador',     'Manga larga, resistente a chispas, talla L',        7, 32, 12,  4, 'par'),
('Guantes nitrilo talla M x100',  'Desechables, sin polvo, azul',                     7, 32,  5,  2, 'caja'),
('Guantes de hilo con puntos PVC','Antideslizante, talla única',                       7, 32, 20,  6, 'par'),

-- EPP / Lentes
('Lentes de seguridad claros',    'Policarbonato, ANSI Z87.1, antirayadura',           7, 33, 15,  5, 'unidad'),
('Careta facial policarbonato',   'Visor 20x40cm, soporte ajustable',                  7, 33,  4,  2, 'unidad'),

-- EPP / Calzado
('Bota de seguridad punta acero T42','Cuero, suela antideslizante, CE EN ISO 20345',   7, 34,  4,  2, 'par'),
('Bota de seguridad punta acero T43','Cuero, suela antideslizante, CE EN ISO 20345',   7, 34,  4,  2, 'par'),
('Bota de seguridad punta acero T44','Cuero, suela antideslizante, CE EN ISO 20345',   7, 34,  3,  2, 'par'),

-- Materiales de Construcción / Cemento
('Cemento Portland tipo I x42.5kg','Bolsa, resistencia 28 días: 42.5 MPa',            8, 36, 20,  5, 'unidad'),
('Arena fina x m³',               'Lavada, granulometría 0-2mm',                       8, 36,  5,  2, 'unidad'),

-- Consumibles de Almacén / Embalaje
('Cinta de embalaje transparente x6','48mm x100m, adhesivo acrílico',                  9, 41,  8,  3, 'unidad'),
('Stretch film 20" x300m',        'Calibre 80, transparente, manual',                  9, 41,  4,  2, 'rollo');


-- ============================================================
-- MOVIMIENTOS (historial de los últimos 30 días)
-- Requiere que los usuarios tengan IDs 1=Fernando, 2=Omar,
-- 3=Santiago, 4=Alvaro, 5=Rodolfo, 6=Antonio
-- ============================================================

-- Entradas iniciales de inventario (registradas por Fernando, id=1)
INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia_doc, id_usuario, fecha) VALUES
(1,  'ENTRADA', 10, 0, 10, 'Compra inicial de herramientas', 'OC-2025-001', 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2,  'ENTRADA', 20, 0, 20, 'Compra inicial de herramientas', 'OC-2025-001', 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(6,  'ENTRADA',  5, 0,  5, 'Compra inicial equipos eléctricos', 'OC-2025-002', 1, DATE_SUB(NOW(), INTERVAL 29 DAY)),
(18, 'ENTRADA',  8, 0,  8, 'Compra materiales eléctricos', 'OC-2025-003', 1, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(22, 'ENTRADA', 25, 0, 25, 'Compra breakers Schneider', 'OC-2025-003', 1, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(23, 'ENTRADA', 15, 0, 15, 'Compra breakers Schneider', 'OC-2025-003', 1, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(31, 'ENTRADA', 25, 0, 25, 'Compra tubería PVC', 'OC-2025-004', 2, DATE_SUB(NOW(), INTERVAL 27 DAY)),
(32, 'ENTRADA', 20, 0, 20, 'Compra tubería PVC', 'OC-2025-004', 2, DATE_SUB(NOW(), INTERVAL 27 DAY)),
(44, 'ENTRADA', 20, 0, 20, 'Compra EPP personal', 'OC-2025-005', 2, DATE_SUB(NOW(), INTERVAL 26 DAY)),
(45, 'ENTRADA', 12, 0, 12, 'Compra EPP personal', 'OC-2025-005', 2, DATE_SUB(NOW(), INTERVAL 26 DAY)),
(46, 'ENTRADA', 15, 0, 15, 'Compra EPP personal', 'OC-2025-005', 2, DATE_SUB(NOW(), INTERVAL 26 DAY)),
(47, 'ENTRADA',  8, 0,  8, 'Compra EPP personal', 'OC-2025-005', 2, DATE_SUB(NOW(), INTERVAL 26 DAY)),
(40, 'ENTRADA', 12, 0, 12, 'Compra lubricantes', 'OC-2025-006', 1, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(41, 'ENTRADA', 20, 0, 20, 'Compra lubricantes', 'OC-2025-006', 1, DATE_SUB(NOW(), INTERVAL 25 DAY));

-- Salidas a técnicos (últimas 3 semanas)
INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia_doc, id_usuario, id_tecnico, id_orden_trabajo, fecha) VALUES
-- Santiago (id=3) — OT instalación eléctrica
(18, 'SALIDA', 2, 8, 6, 'Instalación tablero eléctrico', 'OC-2025-003', 1, 3, 'OT-2025-001', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(22, 'SALIDA', 5, 25, 20, 'Instalación tablero eléctrico', 'OC-2025-003', 1, 3, 'OT-2025-001', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(27, 'SALIDA', 8, 30, 22, 'Canalización eléctrica', 'OC-2025-003', 1, 3, 'OT-2025-001', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6,  'SALIDA', 1,  5,  4, 'Trabajo en obra Av. Principal', 'OT-2025-001', 1, 3, 'OT-2025-001', DATE_SUB(NOW(), INTERVAL 18 DAY)),

-- Alvaro (id=4) — OT plomería
(31, 'SALIDA', 5, 25, 20, 'Instalación red hidráulica', 'OT-2025-002', 1, 4, 'OT-2025-002', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(32, 'SALIDA', 3, 20, 17, 'Instalación red hidráulica', 'OT-2025-002', 1, 4, 'OT-2025-002', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(35, 'SALIDA', 10, 50, 40, 'Instalación red hidráulica', 'OT-2025-002', 1, 4, 'OT-2025-002', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(15, 'SALIDA', 1,  3,  2, 'Bomba para sistema de riego', 'OT-2025-002', 2, 4, 'OT-2025-002', DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Rodolfo (id=5) — OT mantenimiento equipos
(38, 'SALIDA', 2, 10, 8, 'Mantenimiento preventivo maquinaria', 'OT-2025-003', 1, 5, 'OT-2025-003', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(39, 'SALIDA', 1,  8, 7, 'Mantenimiento preventivo maquinaria', 'OT-2025-003', 1, 5, 'OT-2025-003', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(40, 'SALIDA', 2, 12, 10, 'Cambio de aceite compresor', 'OT-2025-003', 1, 5, 'OT-2025-003', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(41, 'SALIDA', 3, 20, 17, 'Lubricación general equipos', 'OT-2025-003', 1, 5, 'OT-2025-003', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(7,  'SALIDA', 1,  3,  2, 'Desbaste en taller', 'OT-2025-003', 2, 5, 'OT-2025-003', DATE_SUB(NOW(), INTERVAL 12 DAY)),

-- Antonio (id=6) — OT construcción menor
(52, 'SALIDA', 5, 20, 15, 'Trabajo de albañilería', 'OT-2025-004', 2, 6, 'OT-2025-004', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(44, 'SALIDA', 2, 20, 18, 'EPP para obra', 'OT-2025-004', 2, 6, 'OT-2025-004', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(46, 'SALIDA', 3, 15, 12, 'EPP para obra', 'OT-2025-004', 2, 6, 'OT-2025-004', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(48, 'SALIDA', 1, 4, 3, 'Bota talla 42 para Antonio', 'OT-2025-004', 2, 6, 'OT-2025-004', DATE_SUB(NOW(), INTERVAL 11 DAY));

-- Devoluciones parciales
INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, id_tecnico, fecha) VALUES
(22, 'DEVOLUCION', 2, 20, 22, 'Devolución breakers sobrantes OT-001', 1, 3, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(35, 'DEVOLUCION', 5, 40, 45, 'Devolución codos sobrantes OT-002',    1, 4, DATE_SUB(NOW(), INTERVAL  8 DAY)),
(41, 'DEVOLUCION', 1, 17, 18, 'Devolución grasa sobrante OT-003',     1, 5, DATE_SUB(NOW(), INTERVAL  6 DAY));

-- Ajuste de inventario (corrección de conteo físico)
INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, fecha) VALUES
(2,  'AJUSTE', 14, 20, 14, 'Ajuste por conteo físico — 1 unidad dañada', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, 'AJUSTE',  4,  5,  4, 'Ajuste por conteo físico',                   2, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Entradas recientes (esta semana)
INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia_doc, id_usuario, fecha) VALUES
(22, 'ENTRADA', 10, 22, 32, 'Reposición breakers 1P 20A', 'OC-2025-010', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(44, 'ENTRADA',  5, 18, 23, 'Reposición cascos seguridad', 'OC-2025-011', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(18, 'ENTRADA',  3,  6,  9, 'Reposición cable THW 12 AWG', 'OC-2025-012', 1, NOW());


-- ============================================================
-- UBICACIONES DE MATERIAL (ítems actualmente fuera del almacén)
-- ============================================================

-- Obtener IDs de movimientos de SALIDA para vincular ubicaciones
-- Santiago — taladro en obra (lleva 18 días)
INSERT INTO ubicaciones_material
  (id_movimiento, id_producto, id_tecnico, ubicacion, motivo, descripcion,
   estado, fecha_esperada_dev, id_reportado_por)
SELECT m.id, m.id_producto, m.id_tecnico,
  'Obra Av. Principal #45, Piso 3',
  'Instalación tablero eléctrico en curso',
  'El taladro se usa para fijar el tablero. Se estima terminar esta semana.',
  'EN_OBRA',
  DATE_ADD(CURDATE(), INTERVAL 3 DAY),
  3
FROM movimientos m
WHERE m.tipo = 'SALIDA' AND m.id_tecnico = 3 AND m.id_producto = 6
LIMIT 1;

-- Santiago — conduit en obra (lleva 20 días, VENCIDA)
INSERT INTO ubicaciones_material
  (id_movimiento, id_producto, id_tecnico, ubicacion, motivo, descripcion,
   estado, fecha_esperada_dev, id_reportado_por)
SELECT m.id, m.id_producto, m.id_tecnico,
  'Obra Av. Principal #45, Bodega de piso',
  'Canalización pendiente de completar',
  'Quedan 3 tramos por instalar. Material guardado en bodega de la obra bajo llave.',
  'PENDIENTE_DEV',
  DATE_SUB(CURDATE(), INTERVAL 2 DAY),
  3
FROM movimientos m
WHERE m.tipo = 'SALIDA' AND m.id_tecnico = 3 AND m.id_producto = 27
LIMIT 1;

-- Alvaro — bomba en obra (lleva 15 días)
INSERT INTO ubicaciones_material
  (id_movimiento, id_producto, id_tecnico, ubicacion, motivo, descripcion,
   estado, fecha_esperada_dev, id_reportado_por)
SELECT m.id, m.id_producto, m.id_tecnico,
  'Proyecto Riego Finca El Palmar, Km 12',
  'Sistema de riego en instalación',
  'La bomba está instalada provisionalmente. Se retira cuando el cliente apruebe la instalación definitiva.',
  'EN_OBRA',
  DATE_ADD(CURDATE(), INTERVAL 7 DAY),
  4
FROM movimientos m
WHERE m.tipo = 'SALIDA' AND m.id_tecnico = 4 AND m.id_producto = 15
LIMIT 1;

-- Rodolfo — amoladora (lleva 12 días, EN_USO)
INSERT INTO ubicaciones_material
  (id_movimiento, id_producto, id_tecnico, ubicacion, motivo, descripcion,
   estado, fecha_esperada_dev, id_reportado_por)
SELECT m.id, m.id_producto, m.id_tecnico,
  'Taller de mantenimiento, Planta Norte',
  'Trabajos de desbaste en estructura metálica',
  'Proyecto de 3 semanas. La amoladora se usa diariamente.',
  'EN_USO',
  DATE_ADD(CURDATE(), INTERVAL 10 DAY),
  5
FROM movimientos m
WHERE m.tipo = 'SALIDA' AND m.id_tecnico = 5 AND m.id_producto = 7
LIMIT 1;

-- Antonio — cemento (lleva 12 días, PENDIENTE_DEV — vencida)
INSERT INTO ubicaciones_material
  (id_movimiento, id_producto, id_tecnico, ubicacion, motivo, descripcion,
   estado, fecha_esperada_dev, id_reportado_por)
SELECT m.id, m.id_producto, m.id_tecnico,
  'Obra Calle 5 #23, Bodega exterior',
  'Construcción de muro de contención',
  'Se usaron 3 bolsas. Las 2 restantes están en la bodega de la obra. Pendiente recoger.',
  'PENDIENTE_DEV',
  DATE_SUB(CURDATE(), INTERVAL 4 DAY),
  6
FROM movimientos m
WHERE m.tipo = 'SALIDA' AND m.id_tecnico = 6 AND m.id_producto = 52
LIMIT 1;
