const db = require('../config/db');

const ConfiguracionModel = {
  async listar() {
    const [rows] = await db.query(
      'SELECT id, clave, valor, descripcion, updated_at FROM configuracion ORDER BY clave',
    );
    return rows;
  },

  async obtener(clave) {
    const [rows] = await db.query(
      'SELECT id, clave, valor, descripcion, updated_at FROM configuracion WHERE clave = ?',
      [clave],
    );
    return rows[0] || null;
  },

  async obtenerPorId(id) {
    const [rows] = await db.query(
      'SELECT id, clave, valor, descripcion, updated_at FROM configuracion WHERE id = ?',
      [id],
    );
    return rows[0] || null;
  },

  async crear({ clave, valor, descripcion }) {
    const [result] = await db.query(
      'INSERT INTO configuracion (clave, valor, descripcion) VALUES (?, ?, ?)',
      [clave, valor, descripcion || null],
    );
    return result.insertId;
  },

  async actualizar(id, { valor, descripcion }) {
    const campos = [];
    const params = [];
    if (valor !== undefined) { campos.push('valor = ?'); params.push(valor); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); params.push(descripcion); }
    if (!campos.length) return 0;
    params.push(id);
    const [result] = await db.query(
      `UPDATE configuracion SET ${campos.join(', ')} WHERE id = ?`,
      params,
    );
    return result.affectedRows;
  },

  async eliminar(id) {
    const [result] = await db.query('DELETE FROM configuracion WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = ConfiguracionModel;
