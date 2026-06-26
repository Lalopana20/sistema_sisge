const db = require('../config/db');

const SubcategoriaModel = {
  async listar({ id_categoria, page, limit } = {}) {
    let sql = `
      SELECT s.*, c.nombre AS categoria
      FROM subcategorias s
      JOIN categorias c ON s.id_categoria = c.id
      WHERE COALESCE(s.activo, 1) = 1
    `;
    const params = [];
    if (id_categoria) {
      sql += ' AND s.id_categoria = ?';
      params.push(id_categoria);
    }
    sql += ' ORDER BY c.nombre, s.nombre';

    if (page && limit) {
      const countSql = `SELECT COUNT(*) AS total FROM subcategorias WHERE COALESCE(activo, 1) = 1${id_categoria ? ' AND id_categoria = ?' : ''}`;
      const [[{ total }]] = await db.query(countSql, id_categoria ? [id_categoria] : []);
      const offset = (Math.max(1, page) - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);
      const [rows] = await db.query(sql, params);
      return { data: rows, total, page: Number(page), limit: Number(limit) };
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT s.*, c.nombre AS categoria
       FROM subcategorias s
       JOIN categorias c ON s.id_categoria = c.id
       WHERE s.id = ?`,
      [id],
    );
    return rows[0] || null;
  },

  async crear({ id_categoria, nombre, descripcion }) {
    const [result] = await db.query(
      'INSERT INTO subcategorias (id_categoria, nombre, descripcion) VALUES (?, ?, ?)',
      [id_categoria, nombre, descripcion || null],
    );
    return result.insertId;
  },

  async actualizar(id, { id_categoria, nombre, descripcion }) {
    // Actualización parcial: solo los campos que vienen definidos
    const campos = [];
    const vals   = [];
    if (id_categoria !== undefined) { campos.push('id_categoria = ?'); vals.push(id_categoria); }
    if (nombre       !== undefined) { campos.push('nombre = ?');       vals.push(nombre); }
    if (descripcion  !== undefined) { campos.push('descripcion = ?');  vals.push(descripcion || null); }
    if (!campos.length) return 0;
    vals.push(id);
    const [result] = await db.query(
      `UPDATE subcategorias SET ${campos.join(', ')} WHERE id = ?`,
      vals,
    );
    return result.affectedRows;
  },

  async eliminar(id) {
    // Soft delete: marca como inactiva en lugar de borrar físicamente,
    // consistente con el resto de modelos del sistema.
    const [result] = await db.query(
      'UPDATE subcategorias SET activo = 0 WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },
};

module.exports = SubcategoriaModel;
