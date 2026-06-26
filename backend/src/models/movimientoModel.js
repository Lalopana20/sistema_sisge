const db = require('../config/db');

const MovimientoModel = {
  async crear({ id_producto, tipo, cantidad, stock_anterior, stock_nuevo,
    motivo, referencia_doc, id_usuario, id_tecnico, id_orden_trabajo, id_movimiento_origen, observaciones }, conn = db) {
    const [result] = await conn.query(
      `INSERT INTO movimientos
        (id_producto, tipo, cantidad, stock_anterior, stock_nuevo,
         motivo, referencia_doc, id_usuario, id_tecnico, id_orden_trabajo, id_movimiento_origen, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_producto, tipo, cantidad, stock_anterior, stock_nuevo,
        motivo || null, referencia_doc || null, id_usuario,
        id_tecnico || null, id_orden_trabajo || null, id_movimiento_origen || null, observaciones || null],
    );
    return result.insertId;
  },

  async listar({ id_producto, tipo, fecha_inicio, fecha_fin, id_categoria, id_subcategoria, id_tecnico, page, limit } = {}) {
    let sql = `
      SELECT m.*,
             p.nombre  AS producto,
             c.nombre  AS categoria,
             s.nombre  AS subcategoria,
             u.nombre  AS usuario,
             t.nombre  AS tecnico
      FROM movimientos m
      JOIN productos  p ON m.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
      JOIN usuarios   u ON m.id_usuario   = u.id
      LEFT JOIN usuarios t ON m.id_tecnico = t.id
      WHERE 1=1
    `;
    const params = [];

    if (id_producto)     { sql += ' AND m.id_producto = ?';     params.push(id_producto); }
    if (tipo)            { sql += ' AND m.tipo = ?';            params.push(tipo); }
    // Castear a número para evitar mismatch de tipos (JWT devuelve id como number,
    // pero query params de URL llegan como string)
    if (id_tecnico)      { sql += ' AND m.id_tecnico = ?';      params.push(Number(id_tecnico)); }
    if (id_categoria)    { sql += ' AND p.id_categoria = ?';    params.push(id_categoria); }
    if (id_subcategoria) { sql += ' AND p.id_subcategoria = ?'; params.push(id_subcategoria); }
    if (fecha_inicio)    { sql += ' AND DATE(m.fecha) >= ?';    params.push(fecha_inicio); }
    if (fecha_fin)       { sql += ' AND DATE(m.fecha) <= ?';    params.push(fecha_fin); }

    sql += ' ORDER BY m.fecha DESC';

    if (page && limit) {
      let countSql = 'SELECT COUNT(*) AS total FROM movimientos m JOIN productos p ON m.id_producto = p.id WHERE 1=1';
      if (id_producto)     countSql += ' AND m.id_producto = ?';
      if (tipo)            countSql += ' AND m.tipo = ?';
      if (id_tecnico)      countSql += ' AND m.id_tecnico = ?';
      if (id_categoria)    countSql += ' AND p.id_categoria = ?';
      if (id_subcategoria) countSql += ' AND p.id_subcategoria = ?';
      if (fecha_inicio)    countSql += ' AND DATE(m.fecha) >= ?';
      if (fecha_fin)       countSql += ' AND DATE(m.fecha) <= ?';
      const [[{ total }]] = await db.query(countSql, params);
      const offset = (Math.max(1, page) - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);
      const [rows] = await db.query(sql, params);
      return { data: rows, total, page: Number(page), limit: Number(limit) };
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async actualizar(id, { motivo, referencia_doc, observaciones }) {
    const campos = [];
    const vals   = [];
    if (motivo !== undefined)         { campos.push('motivo = ?');         vals.push(motivo); }
    if (referencia_doc !== undefined) { campos.push('referencia_doc = ?'); vals.push(referencia_doc); }
    if (observaciones !== undefined)  { campos.push('observaciones = ?');  vals.push(observaciones); }
    if (!campos.length) return 0;
    vals.push(id);
    const [result] = await db.query(
      `UPDATE movimientos SET ${campos.join(', ')} WHERE id = ?`,
      vals,
    );
    return result.affectedRows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*,
              p.nombre AS producto,
              c.nombre AS categoria,
              u.nombre AS usuario
       FROM movimientos m
       JOIN productos  p ON m.id_producto = p.id
       JOIN categorias c ON p.id_categoria = c.id
       JOIN usuarios   u ON m.id_usuario   = u.id
       WHERE m.id = ?`,
      [id],
    );
    return rows[0] || null;
  },
};

module.exports = MovimientoModel;
