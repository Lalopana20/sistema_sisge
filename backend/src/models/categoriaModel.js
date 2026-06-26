const db = require('../config/db');

const CategoriaModel = {
  async listar({ page, limit } = {}) {
    // COALESCE(activo, 1) para compatibilidad con BD sin migración add_mejoras_v2
    let sql = 'SELECT * FROM categorias WHERE COALESCE(activo, 1) = 1 ORDER BY nombre';
    const params = [];

    if (page && limit) {
      const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM categorias WHERE COALESCE(activo, 1) = 1');
      const offset = (Math.max(1, page) - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);
      const [rows] = await db.query(sql, params);
      return { data: rows, total, page: Number(page), limit: Number(limit) };
    }

    const [rows] = await db.query(sql);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, descripcion }) {
    const [result] = await db.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null],
    );
    return result.insertId;
  },

  async actualizar(id, { nombre, descripcion }) {
    const [result] = await db.query(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion || null, id],
    );
    return result.affectedRows;
  },

  async eliminar(id) {
    // Soft delete — requiere columna activo (add_mejoras_v2.sql)
    const [result] = await db.query(
      'UPDATE categorias SET activo = 0 WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },
};

module.exports = CategoriaModel;
