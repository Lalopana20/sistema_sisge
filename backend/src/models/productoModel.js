const db = require('../config/db');

const ProductoModel = {
  async listar({ id_categoria, id_subcategoria, page, limit } = {}) {
    // Construir WHERE por separado para reutilizarlo en el COUNT
    let where = 'WHERE p.activo = 1';
    const params = [];
    if (id_categoria)    { where += ' AND p.id_categoria = ?';    params.push(id_categoria); }
    if (id_subcategoria) { where += ' AND p.id_subcategoria = ?'; params.push(id_subcategoria); }

    const baseSql = `
      SELECT p.*, c.nombre AS categoria, s.nombre AS subcategoria
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
      ${where}
      ORDER BY p.nombre
    `;

    if (page && limit) {
      const countSql = `SELECT COUNT(*) AS total FROM productos p ${where}`;
      const [[{ total }]] = await db.query(countSql, params);
      const offset = (Math.max(1, page) - 1) * limit;
      const [rows] = await db.query(baseSql + ' LIMIT ? OFFSET ?', [...params, Number(limit), offset]);
      return { data: rows, total, page: Number(page), limit: Number(limit) };
    }

    const [rows] = await db.query(baseSql, params);
    return rows;
  },

  async listarTodos() {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria, s.nombre AS subcategoria
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id
       LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
       WHERE p.activo = 1 ORDER BY p.nombre`,
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria, s.nombre AS subcategoria
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id
       LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
       WHERE p.id = ?`,
      [id],
    );
    return rows[0] || null;
  },

  async crear({ nombre, descripcion, id_categoria, id_subcategoria, stock_actual = 0, stock_minimo = 0, unidad_medida }) {
    const [result] = await db.query(
      `INSERT INTO productos (nombre, descripcion, id_categoria, id_subcategoria, stock_actual, stock_minimo, unidad_medida)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, id_categoria, id_subcategoria || null, stock_actual, stock_minimo, unidad_medida || 'unidad'],
    );
    return result.insertId;
  },

  async actualizar(id, { nombre, descripcion, id_categoria, id_subcategoria, stock_minimo, unidad_medida }) {
    const [result] = await db.query(
      `UPDATE productos SET nombre = ?, descripcion = ?, id_categoria = ?, id_subcategoria = ?,
       stock_minimo = ?, unidad_medida = ? WHERE id = ?`,
      [nombre, descripcion || null, id_categoria, id_subcategoria || null, stock_minimo, unidad_medida, id],
    );
    return result.affectedRows;
  },

  async actualizarStock(id, nuevo_stock, conn = db) {
    const [result] = await conn.query(
      'UPDATE productos SET stock_actual = ? WHERE id = ?',
      [nuevo_stock, id],
    );
    return result.affectedRows;
  },

  async eliminar(id) {
    const [result] = await db.query(
      'UPDATE productos SET activo = 0 WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },

  async stockBajo() {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria, s.nombre AS subcategoria
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id
       LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
       WHERE p.stock_actual <= p.stock_minimo AND p.activo = 1
       ORDER BY p.stock_actual ASC`,
    );
    return rows;
  },
};

module.exports = ProductoModel;
