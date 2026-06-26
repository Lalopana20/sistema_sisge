const db = require('../config/db');

const UbicacionModel = {

  // ── Crear una nueva ubicación para un movimiento de SALIDA ────────────────
  async crear({
    id_movimiento, id_producto, id_tecnico,
    ubicacion, motivo, descripcion,
    estado = 'EN_USO', fecha_esperada_dev,
    id_reportado_por,
  }) {
    const [result] = await db.query(
      `INSERT INTO ubicaciones_material
        (id_movimiento, id_producto, id_tecnico,
         ubicacion, motivo, descripcion,
         estado, fecha_esperada_dev, id_reportado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_movimiento, id_producto, id_tecnico,
        ubicacion, motivo, descripcion || null,
        estado, fecha_esperada_dev || null,
        id_reportado_por,
      ],
    );
    return result.insertId;
  },

  // ── Obtener una ubicación por id ──────────────────────────────────────────
  async findById(id) {
    const [rows] = await db.query(
      `SELECT u.*,
              p.nombre  AS producto,
              t.nombre  AS tecnico,
              r.nombre  AS reportado_por,
              c.nombre  AS cerrado_por_nombre,
              m.tipo    AS movimiento_tipo,
              m.cantidad AS movimiento_cantidad,
              m.fecha   AS movimiento_fecha
       FROM ubicaciones_material u
       JOIN productos  p ON u.id_producto      = p.id
       JOIN usuarios   t ON u.id_tecnico       = t.id
       JOIN usuarios   r ON u.id_reportado_por = r.id
       LEFT JOIN usuarios c ON u.id_cerrado_por = c.id
       JOIN movimientos m ON u.id_movimiento   = m.id
       WHERE u.id = ?`,
      [id],
    );
    return rows[0] || null;
  },

  // ── Obtener ubicación por id_movimiento ───────────────────────────────────
  async findByMovimiento(id_movimiento) {
    const [rows] = await db.query(
      `SELECT u.*,
              p.nombre  AS producto,
              t.nombre  AS tecnico,
              r.nombre  AS reportado_por
       FROM ubicaciones_material u
       JOIN productos p ON u.id_producto      = p.id
       JOIN usuarios  t ON u.id_tecnico       = t.id
       JOIN usuarios  r ON u.id_reportado_por = r.id
       WHERE u.id_movimiento = ?`,
      [id_movimiento],
    );
    return rows[0] || null;
  },

  // ── Listar con filtros ────────────────────────────────────────────────────
  async listar({ estado, id_tecnico, id_producto, vencidas, page, limit } = {}) {
    let sql = `
      SELECT u.*,
             p.nombre   AS producto,
             c.nombre   AS categoria,
             t.nombre   AS tecnico,
             r.nombre   AS reportado_por,
             m.cantidad AS movimiento_cantidad,
             m.fecha    AS movimiento_fecha,
             m.id_orden_trabajo,
             DATEDIFF(CURDATE(), DATE(m.fecha)) AS dias_fuera
      FROM ubicaciones_material u
      JOIN productos  p ON u.id_producto      = p.id
      JOIN categorias c ON p.id_categoria     = c.id
      JOIN usuarios   t ON u.id_tecnico       = t.id
      JOIN usuarios   r ON u.id_reportado_por = r.id
      JOIN movimientos m ON u.id_movimiento   = m.id
      WHERE 1=1
    `;
    const params = [];

    if (estado)      { sql += ' AND u.estado = ?';      params.push(estado); }
    if (id_tecnico)  { sql += ' AND u.id_tecnico = ?';  params.push(id_tecnico); }
    if (id_producto) { sql += ' AND u.id_producto = ?'; params.push(id_producto); }

    // Solo ítems cuya fecha esperada de devolución ya pasó y no están devueltos
    if (vencidas === 'true' || vencidas === true) {
      sql += ` AND u.estado != 'DEVUELTO'
               AND u.fecha_esperada_dev IS NOT NULL
               AND u.fecha_esperada_dev < CURDATE()`;
    }

    sql += ' ORDER BY u.estado ASC, u.fecha_esperada_dev ASC, u.created_at DESC';

    if (page && limit) {
      let countSql = `SELECT COUNT(*) AS total FROM ubicaciones_material u
       JOIN productos  p ON u.id_producto      = p.id
       JOIN categorias c ON p.id_categoria     = c.id
       JOIN usuarios   t ON u.id_tecnico       = t.id
       JOIN usuarios   r ON u.id_reportado_por = r.id
       JOIN movimientos m ON u.id_movimiento   = m.id
       WHERE 1=1`;
      const countParams = [];
      if (estado)      { countSql += ' AND u.estado = ?';      countParams.push(estado); }
      if (id_tecnico)  { countSql += ' AND u.id_tecnico = ?';  countParams.push(id_tecnico); }
      if (id_producto) { countSql += ' AND u.id_producto = ?'; countParams.push(id_producto); }
      if (vencidas === 'true' || vencidas === true) {
        countSql += ` AND u.estado != 'DEVUELTO'
                 AND u.fecha_esperada_dev IS NOT NULL
                 AND u.fecha_esperada_dev < CURDATE()`;
      }
      const [[{ total }]] = await db.query(countSql, countParams);
      const offset = (Math.max(1, page) - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);
      const [rows] = await db.query(sql, params);
      return { data: rows, total, page: Number(page), limit: Number(limit) };
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  // ── Alertas: ítems sin devolución pasado N días ───────────────────────────
  async alertas(diasLimite = 7) {
    const [rows] = await db.query(
      `SELECT u.*,
              p.nombre   AS producto,
              c.nombre   AS categoria,
              t.nombre   AS tecnico,
              m.cantidad AS movimiento_cantidad,
              m.fecha    AS movimiento_fecha,
              m.id_orden_trabajo,
              DATEDIFF(CURDATE(), DATE(m.fecha)) AS dias_fuera
       FROM ubicaciones_material u
       JOIN productos  p ON u.id_producto    = p.id
       JOIN categorias c ON p.id_categoria   = c.id
       JOIN usuarios   t ON u.id_tecnico     = t.id
       JOIN movimientos m ON u.id_movimiento = m.id
       WHERE u.estado != 'DEVUELTO'
         AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= ?
       ORDER BY dias_fuera DESC`,
      [diasLimite],
    );
    return rows;
  },

  // ── Conteo de alertas activas (para el dashboard) ─────────────────────────
  async conteoAlertas(diasLimite = 7) {
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM ubicaciones_material u
       JOIN movimientos m ON u.id_movimiento = m.id
       WHERE u.estado != 'DEVUELTO'
         AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= ?`,
      [diasLimite],
    );
    return row.total;
  },

  // ── Actualizar ubicación (técnico o admin pueden editar) ──────────────────
  async actualizar(id, { ubicacion, motivo, descripcion, estado, fecha_esperada_dev }) {
    const campos = [];
    const vals   = [];
    if (ubicacion !== undefined)         { campos.push('ubicacion = ?');          vals.push(ubicacion); }
    if (motivo !== undefined)            { campos.push('motivo = ?');             vals.push(motivo); }
    if (descripcion !== undefined)       { campos.push('descripcion = ?');        vals.push(descripcion || null); }
    if (estado !== undefined)            { campos.push('estado = ?');             vals.push(estado); }
    if (fecha_esperada_dev !== undefined){ campos.push('fecha_esperada_dev = ?'); vals.push(fecha_esperada_dev || null); }
    if (!campos.length) return 0;
    vals.push(id);
    const [result] = await db.query(
      `UPDATE ubicaciones_material SET ${campos.join(', ')} WHERE id = ?`,
      vals,
    );
    return result.affectedRows;
  },

  // ── Eliminar (hard delete) ────────────────────────────────────────────────
  async eliminar(id) {
    const [result] = await db.query(
      'DELETE FROM ubicaciones_material WHERE id = ?', [id],
    );
    return result.affectedRows;
  },

  // ── Cerrar (marcar como DEVUELTO) ─────────────────────────────────────────
  async cerrar(id, { id_cerrado_por, nota_cierre }) {
    const [result] = await db.query(
      `UPDATE ubicaciones_material
       SET estado = 'DEVUELTO',
           fecha_devolucion = NOW(),
           id_cerrado_por = ?,
           nota_cierre = ?
       WHERE id = ?`,
      [id_cerrado_por, nota_cierre || null, id],
    );
    return result.affectedRows;
  },
};

module.exports = UbicacionModel;
