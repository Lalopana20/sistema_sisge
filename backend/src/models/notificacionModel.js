const db = require('../config/db');

const NotificacionModel = {
  async listar(id_usuario, { page = 1, limit = 20 } = {}) {
    const countParams = [id_usuario];
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM notificaciones WHERE id_usuario = ?', countParams,
    );
    const offset = (Math.max(1, page) - 1) * limit;
    const [rows] = await db.query(
      `SELECT id, tipo, titulo, mensaje, leida, url, created_at
       FROM notificaciones
       WHERE id_usuario = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [id_usuario, Number(limit), offset],
    );
    return { data: rows, total, page: Number(page), limit: Number(limit) };
  },

  async noLeidas(id_usuario) {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM notificaciones WHERE id_usuario = ? AND leida = FALSE', [id_usuario],
    );
    return total;
  },

  async crear({ id_usuario, tipo, titulo, mensaje, url }) {
    const [result] = await db.query(
      `INSERT INTO notificaciones (id_usuario, tipo, titulo, mensaje, url)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, tipo || 'INFO', titulo, mensaje || null, url || null],
    );
    return result.insertId;
  },

  async marcarLeida(id, id_usuario) {
    const [result] = await db.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND id_usuario = ?',
      [id, id_usuario],
    );
    return result.affectedRows;
  },

  async marcarTodasLeidas(id_usuario) {
    const [result] = await db.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id_usuario = ? AND leida = FALSE',
      [id_usuario],
    );
    return result.affectedRows;
  },
};

module.exports = NotificacionModel;
