/**
 * Crea tabla subcategorias, columna en productos y datos iniciales.
 * Ejecutar: node scripts/setupSubcategorias.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const SUBCATEGORIAS = {
  'Herramientas': [
    'Manuales', 'Eléctricas portátiles', 'Medición', 'Neumáticas', 'Especializadas',
  ],
  'Equipos y Maquinaria': [
    'Generadores', 'Compresores y bombas', 'Andamios y escaleras', 'Soldadura', 'Maquinaria ligera',
  ],
  'Materiales Eléctricos': [
    'Cables y conductores', 'Interruptores y breakers', 'Tomacorrientes', 'Canalización', 'Iluminación',
  ],
  'Materiales de Plomería': [
    'Tubería', 'Conexiones y codos', 'Llaves y válvulas', 'Selladores', 'Accesorios sanitarios',
  ],
  'Repuestos y Componentes': [
    'Motores y bombas', 'Rodamientos y bandas', 'Filtros', 'Sensores y controles', 'Piezas por equipo',
  ],
  'Insumos de Mantenimiento': [
    'Lubricantes y grasas', 'Desengrasantes', 'Pinturas', 'Adhesivos industriales', 'Abrasivos',
  ],
  'EPP': [
    'Cascos y barbijos', 'Guantes', 'Lentes y caretas', 'Calzado de seguridad', 'Arnés y línea de vida',
  ],
  'Materiales de Construcción': [
    'Cemento y agregados', 'Bloques y ladrillos', 'Varilla y malla', 'Impermeabilizantes', 'Ferretería estructural',
  ],
  'Consumibles de Almacén': [
    'Embalaje', 'Etiquetas', 'Papelería', 'Contenedores', 'Limpieza de área',
  ],
};

async function main() {
  console.log('\n🔧 SISGE — Subcategorías\n');

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'sisge_almacen',
    port:     process.env.DB_PORT     || 3306,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS subcategorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_categoria INT NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT,
      UNIQUE KEY uk_subcat_cat_nombre (id_categoria, nombre)
    )
  `);

  try {
    await conn.query(
      'ALTER TABLE productos ADD COLUMN id_subcategoria INT NULL AFTER id_categoria',
    );
    console.log('✅ Columna id_subcategoria agregada');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('ℹ️  Columna id_subcategoria ya existe');
    else throw err;
  }

  try {
    await conn.query(`
      ALTER TABLE productos
      ADD CONSTRAINT fk_producto_subcategoria
      FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id) ON DELETE SET NULL
    `);
    console.log('✅ FK producto → subcategoría');
  } catch (err) {
    if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_CANT_CREATE_TABLE') {
      console.log('ℹ️  FK ya configurada');
    } else throw err;
  }

  const [cats] = await conn.query('SELECT id, nombre FROM categorias');
  const mapCat = Object.fromEntries(cats.map((c) => [c.nombre, c.id]));

  let creadas = 0;
  for (const [catNombre, subs] of Object.entries(SUBCATEGORIAS)) {
    const idCat = mapCat[catNombre];
    if (!idCat) {
      console.warn(`⚠️  Categoría no encontrada: ${catNombre}`);
      continue;
    }
    for (const nombre of subs) {
      const [existe] = await conn.query(
        'SELECT id FROM subcategorias WHERE id_categoria = ? AND nombre = ?',
        [idCat, nombre],
      );
      if (existe.length === 0) {
        await conn.query(
          'INSERT INTO subcategorias (id_categoria, nombre) VALUES (?, ?)',
          [idCat, nombre],
        );
        creadas++;
      }
    }
  }

  console.log(`✅ Subcategorías listas (${creadas} nuevas insertadas)\n`);
  await conn.end();
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
