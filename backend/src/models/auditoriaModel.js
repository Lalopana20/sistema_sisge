const db = require('../config/db');

const AuditoriaModel = {
  async crear(data) {
    const [result] = await db.query(
      `INSERT INTO auditoria
        (id_usuario, usuario_nombre, usuario_email, usuario_rol,
         accion, modulo, entidad_id, entidad_nombre, detalle, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_usuario, data.usuario_nombre, data.usuario_email, data.usuario_rol,
        data.accion, data.modulo, data.entidad_id, data.entidad_nombre,
        data.detalle, data.ip, data.user_agent,
      ],
    );
    return result.insertId;
  },

  async listar({ fecha_inicio, fecha_fin, id_usuario, modulo, accion, page = 1, limit = 50 } = {}) {
    let sql = 'SELECT * FROM auditoria WHERE 1=1';
    const params = [];

    if (fecha_inicio) { sql += ' AND DATE(fecha) >= ?'; params.push(fecha_inicio); }
    if (fecha_fin)    { sql += ' AND DATE(fecha) <= ?'; params.push(fecha_fin); }
    if (id_usuario)   { sql += ' AND id_usuario = ?';   params.push(id_usuario); }
    if (modulo)       { sql += ' AND modulo = ?';       params.push(modulo); }
    if (accion)       { sql += ' AND accion = ?';       params.push(accion); }

    // Guardar los params de filtro antes de agregar LIMIT/OFFSET
    const countParams = [...params];

    const offset = (Math.max(1, page) - 1) * limit;
    sql += ' ORDER BY fecha DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await db.query(sql, params);

    // Construir countSql con los mismos filtros aplicados
    let countSql = 'SELECT COUNT(*) AS total FROM auditoria WHERE 1=1';
    if (fecha_inicio) countSql += ' AND DATE(fecha) >= ?';
    if (fecha_fin)    countSql += ' AND DATE(fecha) <= ?';
    if (id_usuario)   countSql += ' AND id_usuario = ?';
    if (modulo)       countSql += ' AND modulo = ?';
    if (accion)       countSql += ' AND accion = ?';
    const [[{ total }]] = await db.query(countSql, countParams);

    return {
      data: rows.map((r) => ({
        ...r,
        detalle: r.detalle ? (typeof r.detalle === 'string' ? JSON.parse(r.detalle) : r.detalle) : null,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  },
};

module.exports = AuditoriaModel;
