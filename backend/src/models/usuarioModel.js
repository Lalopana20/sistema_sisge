const db = require('../config/db');

const UsuarioModel = {
  async findByUsernameRaw(username) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE username = ?', [username],
    );
    return rows[0] || null;
  },

  async findByEmailRaw(email) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?', [email],
    );
    return rows[0] || null;
  },

  async findByNombreRaw(nombre) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE LOWER(nombre) = LOWER(?)', [nombre],
    );
    return rows[0] || null;
  },

  async findByUsername(username) {
    // Buscar por username (case-insensitive ya que el login normaliza a minúsculas)
    // La columna activo puede no existir en instalaciones sin migración — usar COALESCE
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE username = ? AND COALESCE(activo, 1) = 1',
      [username],
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, nombre, username, email, rol, created_at FROM usuarios WHERE id = ? AND COALESCE(activo, 1) = 1', [id],
    );
    return rows[0] || null;
  },

  async crear({ nombre, username, email, password_hash, rol = 'operario' }) {
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, username, email || null, password_hash, rol],
    );
    return result.insertId;
  },

  async listar({ page, limit, rol } = {}) {
    // Construir WHERE dinámico para soportar filtro por rol (usado por el frontend
    // para cargar solo técnicos/operarios en selectores de movimientos y ubicaciones)
    let where = 'WHERE COALESCE(activo, 1) = 1';
    const params = [];
    if (rol) {
      where += ' AND rol = ?';
      params.push(rol);
    }

    let sql = `SELECT id, nombre, username, email, rol, created_at FROM usuarios ${where} ORDER BY nombre`;

    if (page && limit) {
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM usuarios ${where}`,
        params,
      );
      const offset = (Math.max(1, page) - 1) * limit;
      const [rows] = await db.query(sql + ' LIMIT ? OFFSET ?', [...params, Number(limit), offset]);
      return { data: rows, total, page: Number(page), limit: Number(limit) };
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async actualizar(id, { nombre, username, email, rol, password_hash }) {
    const campos = [];
    const vals   = [];
    if (nombre !== undefined)        { campos.push('nombre = ?');        vals.push(nombre); }
    if (username !== undefined)      { campos.push('username = ?');      vals.push(username); }
    if (email !== undefined)         { campos.push('email = ?');         vals.push(email); }
    if (rol !== undefined)           { campos.push('rol = ?');           vals.push(rol); }
    if (password_hash !== undefined) { campos.push('password_hash = ?'); vals.push(password_hash); }
    if (!campos.length) return 0;
    vals.push(id);
    const [result] = await db.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      vals,
    );
    return result.affectedRows;
  },

  async eliminar(id) {
    const [result] = await db.query(
      'UPDATE usuarios SET activo = 0 WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },

  async findByIdRaw(id) {
    const [rows] = await db.query(
      'SELECT id, nombre, username, email, rol, activo FROM usuarios WHERE id = ?', [id],
    );
    return rows[0] || null;
  },

  async cambiarEstado(id, activo) {
    const [result] = await db.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo ? 1 : 0, id],
    );
    return result.affectedRows;
  },

  async tieneMovimientos(id) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS total FROM movimientos WHERE id_usuario = ? OR id_tecnico = ?',
      [id, id],
    );
    return rows[0].total > 0;
  },
};

module.exports = UsuarioModel;
