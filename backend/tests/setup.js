jest.setTimeout(30000);

process.env.DB_NAME = process.env.DB_NAME || 'sisge_almacen_test';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest-1234567890';
process.env.JWT_EXPIRES_IN = '1h';

const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const SEED = {
  id_categoria: null,
  id_producto: null,
  id_admin: null,
  id_operario: null,
  id_movimiento: null,
  password_hash: null,
};

async function ensureSchema() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS subcategorias (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nombre varchar(100) NOT NULL,
      descripcion text DEFAULT NULL,
      id_categoria int(11) NOT NULL,
      activo tinyint(1) NOT NULL DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      FOREIGN KEY (id_categoria) REFERENCES categorias(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci`,
    `CREATE TABLE IF NOT EXISTS categorias (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nombre varchar(100) NOT NULL,
      descripcion text DEFAULT NULL,
      activo tinyint(1) NOT NULL DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci`,
    `CREATE TABLE IF NOT EXISTS usuarios (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nombre varchar(100) NOT NULL,
      username varchar(50) NOT NULL UNIQUE,
      email varchar(150) DEFAULT NULL UNIQUE,
      password_hash varchar(255) NOT NULL,
      rol enum('admin','supervisor','operario') NOT NULL DEFAULT 'operario',
      activo tinyint(1) NOT NULL DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci`,
    `CREATE TABLE IF NOT EXISTS productos (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nombre varchar(150) NOT NULL,
      descripcion text DEFAULT NULL,
      id_categoria int(11) NOT NULL,
      id_subcategoria int(11) DEFAULT NULL,
      stock_actual decimal(10,2) NOT NULL DEFAULT 0.00,
      stock_minimo decimal(10,2) NOT NULL DEFAULT 0.00,
      unidad_medida varchar(30) NOT NULL DEFAULT 'unidad',
      activo tinyint(1) NOT NULL DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      FOREIGN KEY (id_categoria) REFERENCES categorias(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci`,
    `CREATE TABLE IF NOT EXISTS movimientos (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      id_producto int(11) NOT NULL,
      tipo enum('ENTRADA','SALIDA','DEVOLUCION','AJUSTE') NOT NULL,
      cantidad decimal(10,2) NOT NULL,
      stock_anterior decimal(10,2) NOT NULL,
      stock_nuevo decimal(10,2) NOT NULL,
      motivo varchar(200) DEFAULT NULL,
      referencia_doc varchar(100) DEFAULT NULL,
      id_usuario int(11) NOT NULL,
      id_tecnico int(11) DEFAULT NULL,
      id_orden_trabajo varchar(50) DEFAULT NULL,
      id_movimiento_origen int(11) DEFAULT NULL,
      observaciones text DEFAULT NULL,
      fecha timestamp NOT NULL DEFAULT current_timestamp(),
      FOREIGN KEY (id_producto) REFERENCES productos(id),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci`,
    `CREATE TABLE IF NOT EXISTS permisos (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      rol enum('admin','supervisor','operario') NOT NULL,
      modulo varchar(50) NOT NULL,
      puede_ver tinyint(1) NOT NULL DEFAULT 0,
      puede_crear tinyint(1) NOT NULL DEFAULT 0,
      puede_editar tinyint(1) NOT NULL DEFAULT 0,
      puede_eliminar tinyint(1) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
    `CREATE TABLE IF NOT EXISTS sesiones_invalidas (
      id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      id_usuario int(11) NOT NULL,
      token_hash varchar(64) NOT NULL,
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
    `CREATE TABLE IF NOT EXISTS auditoria (
      id bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      fecha timestamp NOT NULL DEFAULT current_timestamp(),
      id_usuario int(11) DEFAULT NULL,
      usuario_nombre varchar(100) DEFAULT NULL,
      usuario_email varchar(150) DEFAULT NULL,
      usuario_rol varchar(20) DEFAULT NULL,
      accion varchar(50) NOT NULL,
      modulo varchar(50) NOT NULL,
      entidad_id int(11) DEFAULT NULL,
      entidad_nombre varchar(200) DEFAULT NULL,
      detalle longtext DEFAULT NULL,
      ip varchar(45) DEFAULT NULL,
      user_agent varchar(255) DEFAULT NULL,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
  ];
  for (const sql of tables) {
    try {
      await db.query(sql);
    } catch (err) {
      // table may already exist
    }
  }
  // Seed permisos if empty
  const [rows] = await db.query('SELECT COUNT(*) as cnt FROM permisos');
  if (rows[0].cnt === 0) {
    const roles = ['admin', 'supervisor', 'operario'];
    const modulos = ['dashboard','productos','categorias','subcategorias','movimientos','historial','ubicaciones','reportes','usuarios','auditoria','importar'];
    for (const rol of roles) {
      for (const modulo of modulos) {
        await db.query(
          'INSERT INTO permisos (rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES (?,?,?,?,?,?)',
          [rol, modulo, 1, 1, 1, 1],
        );
      }
    }
  }
}

async function seedBase() {
  await ensureSchema();
  SEED.password_hash = await bcrypt.hash('test1234', 10);

  const [cat] = await db.query(
    'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
    ['Test Category', 'Created by test setup'],
  );
  SEED.id_categoria = cat.insertId;

  const [prod] = await db.query(
    `INSERT INTO productos (nombre, descripcion, id_categoria, stock_actual, stock_minimo, unidad_medida)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Test Product', 'Test product description', SEED.id_categoria, 100, 10, 'unidad'],
  );
  SEED.id_producto = prod.insertId;

  const [admin] = await db.query(
    'INSERT INTO usuarios (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
    ['Admin Test', 'admintest', 'admin@test.com', SEED.password_hash, 'admin'],
  );
  SEED.id_admin = admin.insertId;

  const [oper] = await db.query(
    'INSERT INTO usuarios (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
    ['Operario Test', 'operariotest', 'operario@test.com', SEED.password_hash, 'operario'],
  );
  SEED.id_operario = oper.insertId;

  const [mov] = await db.query(
    `INSERT INTO movimientos (id_producto, tipo, cantidad, stock_anterior, stock_nuevo, id_usuario)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [SEED.id_producto, 'ENTRADA', 100, 0, 100, SEED.id_admin],
  );
  SEED.id_movimiento = mov.insertId;
}

function getSeed() {
  return SEED;
}

const TABLES = [
  'ubicaciones_material',
  'movimientos',
  'permisos_usuario',
  'permisos',
  'notificaciones',
  'sesiones_invalidas',
  'auditoria',
  'productos',
  'subcategorias',
  'categorias',
  'usuarios',
];

async function cleanup() {
  for (const table of TABLES) {
    try {
      await db.query(`DELETE FROM \`${table}\``);
    } catch (err) {
      // ignore if table doesn't exist (e.g. migration not applied)
    }
  }
}

module.exports = { seedBase, getSeed, cleanup };
