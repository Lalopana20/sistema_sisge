const db = require('../config/db');

const ActividadService = {
  async listar({ id_usuario, page = 1, limit = 20 } = {}) {
    if (!id_usuario) return { data: [], total: 0, page: 1, limit };

    const offset = (Math.max(1, page) - 1) * limit;
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM auditoria WHERE id_usuario = ?',
      [id_usuario],
    );
    const [rows] = await db.query(
      `SELECT id, accion, modulo, entidad_id, entidad_nombre, detalle, fecha
       FROM auditoria
       WHERE id_usuario = ?
       ORDER BY fecha DESC
       LIMIT ? OFFSET ?`,
      [id_usuario, Number(limit), offset],
    );
    return {
      data: rows.map(r => ({
        ...r,
        detalle: r.detalle ? (typeof r.detalle === 'string' ? JSON.parse(r.detalle) : r.detalle) : null,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  },
};

module.exports = ActividadService;
