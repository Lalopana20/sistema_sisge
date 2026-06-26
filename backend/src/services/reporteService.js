const db = require('../config/db');

const ReporteService = {

  // ── Dashboard completo (KPIs + listas rápidas) ──────────────────────────
  async dashboardCompleto() {
    // Ejecutar todas las queries en paralelo para reducir latencia
    const [
      [[{ total_productos }]],
      [[{ total_movimientos }]],
      [[{ stock_bajo }]],
      [[{ total_ubicaciones }]],
      [[{ alertas }]],
      [movimientos_por_tipo],
      [movimientos_recientes],
      [productos_bajo],
      [top_almacenados],
    ] = await Promise.all([
      db.query('SELECT COUNT(*) AS total_productos FROM productos WHERE activo = 1'),
      db.query('SELECT COUNT(*) AS total_movimientos FROM movimientos'),
      db.query('SELECT COUNT(*) AS stock_bajo FROM productos WHERE stock_actual <= stock_minimo AND activo = 1'),
      db.query("SELECT COUNT(*) AS total_ubicaciones FROM ubicaciones_material WHERE estado != 'DEVUELTO'"),
      db.query(
        `SELECT COUNT(*) AS alertas FROM ubicaciones_material u
         JOIN movimientos m ON u.id_movimiento = m.id
         WHERE u.estado != 'DEVUELTO' AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= 7`,
      ),
      db.query('SELECT tipo, COUNT(*) AS total FROM movimientos GROUP BY tipo'),
      db.query(
        `SELECT m.id, m.tipo, m.cantidad, m.fecha, p.nombre AS producto
         FROM movimientos m
         JOIN productos p ON m.id_producto = p.id
         ORDER BY m.fecha DESC LIMIT 10`,
      ),
      db.query(
        `SELECT p.id, p.nombre, p.stock_actual, p.stock_minimo, p.unidad_medida,
                c.nombre AS categoria
         FROM productos p
         JOIN categorias c ON p.id_categoria = c.id
         WHERE p.stock_actual <= p.stock_minimo AND p.activo = 1
         ORDER BY p.stock_actual ASC LIMIT 10`,
      ),
      db.query(
        `SELECT p.id, p.nombre, p.stock_actual, p.unidad_medida, c.nombre AS categoria
         FROM productos p
         JOIN categorias c ON p.id_categoria = c.id
         WHERE p.activo = 1 ORDER BY p.stock_actual DESC LIMIT 10`,
      ),
    ]);
    return {
      total_productos, total_movimientos, stock_bajo, total_ubicaciones, alertas,
      movimientos_por_tipo, movimientos_recientes, productos_bajo, top_almacenados,
    };
  },

  // ── KPIs con tendencia (hoy vs ayer) y actividad de los últimos 7 días ──
  async dashboardKpis() {
    // Ejecutar todas las queries en paralelo
    const [
      [[{ hoy }]],
      [[{ ayer }]],
      [[{ entradas_hoy }]],
      [[{ salidas_hoy }]],
      [actividad_7dias],
      [[{ productos_semana }]],
      [[{ total_items_stock }]],
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS hoy FROM movimientos WHERE DATE(fecha) = CURDATE()"),
      db.query("SELECT COUNT(*) AS ayer FROM movimientos WHERE DATE(fecha) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"),
      db.query("SELECT COUNT(*) AS entradas_hoy FROM movimientos WHERE tipo = 'ENTRADA' AND DATE(fecha) = CURDATE()"),
      db.query("SELECT COUNT(*) AS salidas_hoy FROM movimientos WHERE tipo = 'SALIDA' AND DATE(fecha) = CURDATE()"),
      db.query(`
        SELECT DATE(fecha) AS dia,
          SUM(CASE WHEN tipo = 'ENTRADA'    THEN 1 ELSE 0 END) AS entradas,
          SUM(CASE WHEN tipo = 'SALIDA'     THEN 1 ELSE 0 END) AS salidas,
          SUM(CASE WHEN tipo = 'DEVOLUCION' THEN 1 ELSE 0 END) AS devoluciones,
          COUNT(*) AS total
        FROM movimientos
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(fecha) ORDER BY dia ASC
      `),
      db.query("SELECT COUNT(*) AS productos_semana FROM productos WHERE activo = 1 AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"),
      db.query("SELECT COALESCE(SUM(stock_actual), 0) AS total_items_stock FROM productos WHERE activo = 1"),
    ]);

    const tendencia_movimientos = ayer > 0
      ? Math.round(((hoy - ayer) / ayer) * 100)
      : hoy > 0 ? 100 : 0;

    return {
      movimientos_hoy: hoy, movimientos_ayer: ayer, tendencia_movimientos,
      entradas_hoy, salidas_hoy, productos_semana, total_items_stock, actividad_7dias,
    };
  },

  // ── Reporte por categoría (con filtro de fecha) ──────────────────────────
  async reportePorCategoria({ fecha_inicio, fecha_fin } = {}) {
    // Los parámetros de fecha van en el JOIN de movimientos, no en el WHERE principal.
    // Se construye el fragmento del JOIN condicionalmente para evitar pasar params
    // en posición incorrecta cuando mysql2 los interpola por posición.
    const joinFiltro = [];
    const movParams  = [];
    if (fecha_inicio) { joinFiltro.push('DATE(m.fecha) >= ?'); movParams.push(fecha_inicio); }
    if (fecha_fin)    { joinFiltro.push('DATE(m.fecha) <= ?'); movParams.push(fecha_fin); }

    const joinCondicion = joinFiltro.length
      ? `AND ${joinFiltro.join(' AND ')}`
      : '';

    const sql = `
      SELECT c.id, c.nombre,
             COUNT(DISTINCT p.id)  AS total_productos,
             COALESCE(SUM(p.stock_actual), 0) AS stock_total,
             COALESCE(MIN(p.stock_actual), 0) AS stock_min,
             COALESCE(SUM(CASE WHEN m.tipo IN ('ENTRADA','DEVOLUCION') THEN m.cantidad ELSE 0 END), 0) AS total_entradas,
             COALESCE(SUM(CASE WHEN m.tipo = 'SALIDA' THEN m.cantidad ELSE 0 END), 0) AS total_salidas,
             COUNT(m.id) AS total_movimientos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.id_categoria AND p.activo = 1
      LEFT JOIN movimientos m ON p.id = m.id_producto ${joinCondicion}
      WHERE COALESCE(c.activo, 1) = 1
      GROUP BY c.id, c.nombre ORDER BY c.nombre
    `;
    const [rows] = await db.query(sql, movParams);
    return rows;
  },

  // ── Reporte por producto (con filtros de categoría/subcategoría) ────────
  async reportePorProducto({ id_categoria, id_subcategoria } = {}) {
    let sql = `
      SELECT p.id, p.nombre, p.stock_actual, p.stock_minimo, p.unidad_medida,
             c.nombre AS categoria, s.nombre AS subcategoria,
             (SELECT COUNT(*) FROM movimientos m WHERE m.id_producto = p.id) AS total_movimientos
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
      WHERE p.activo = 1
    `;
    const params = [];
    if (id_categoria)    { sql += ' AND p.id_categoria = ?';    params.push(id_categoria); }
    if (id_subcategoria) { sql += ' AND p.id_subcategoria = ?'; params.push(id_subcategoria); }
    sql += ' ORDER BY p.nombre';
    const [rows] = await db.query(sql, params);
    return rows;
  },

  // ── Reporte stock bajo ────────────────────────────────────────────────────
  async reporteStockBajo() {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id
       WHERE p.stock_actual <= p.stock_minimo AND p.activo = 1
       ORDER BY (p.stock_actual - p.stock_minimo) ASC`,
    );
    return rows;
  },

  // ── Reporte por técnico (ubicaciones pendientes) ─────────────────────────
  async reportePorTecnico() {
    const [rows] = await db.query(
      `SELECT u.id, u.nombre,
              COUNT(um.id) AS total_ubicaciones,
              COALESCE(SUM(CASE WHEN um.estado != 'DEVUELTO' THEN 1 ELSE 0 END), 0) AS pendientes
       FROM usuarios u
       LEFT JOIN ubicaciones_material um ON u.id = um.id_tecnico
       WHERE COALESCE(u.activo, 1) = 1
       GROUP BY u.id, u.nombre ORDER BY pendientes DESC`,
    );
    return rows;
  },

  // ── Exportación Excel ─────────────────────────────────────────────────────
  async exportarData(tipo) {
    const TIPOS_VALIDOS = ['productos', 'movimientos', 'ubicaciones'];
    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      throw Object.assign(new Error(`Tipo inválido: ${tipo}. Use: ${TIPOS_VALIDOS.join(', ')}`), { status: 400 });
    }
    const data = {};
    if (!tipo || tipo === 'productos') {
      const [rows] = await db.query(
        `SELECT p.id, p.nombre, c.nombre AS categoria, p.stock_actual, p.stock_minimo, p.unidad_medida
         FROM productos p JOIN categorias c ON p.id_categoria = c.id
         WHERE p.activo = 1 ORDER BY p.nombre`,
      );
      data.productos = rows;
    }
    if (!tipo || tipo === 'movimientos') {
      const [rows] = await db.query(
        `SELECT m.id, p.nombre AS producto, m.tipo, m.cantidad, m.stock_anterior, m.stock_nuevo,
                u.nombre AS usuario, m.fecha
         FROM movimientos m
         JOIN productos p ON m.id_producto = p.id
         JOIN usuarios u ON m.id_usuario = u.id
         ORDER BY m.fecha DESC`,
      );
      data.movimientos = rows;
    }
    if (!tipo || tipo === 'ubicaciones') {
      const [rows] = await db.query(
        `SELECT u.id, p.nombre AS producto, t.nombre AS tecnico,
                u.ubicacion, u.estado, u.fecha_esperada_dev
         FROM ubicaciones_material u
         JOIN productos p ON u.id_producto = p.id
         JOIN usuarios t ON u.id_tecnico = t.id
         ORDER BY u.estado, u.fecha_esperada_dev`,
      );
      data.ubicaciones = rows;
    }
    return data;
  },

  // ── Consumo por técnico (SALIDA y DEVOLUCION) ─────────────────────────────
  async porTecnico({ id_tecnico, fecha_inicio, fecha_fin } = {}) {
    let sqlResumen = `
      SELECT t.id AS id_tecnico, t.nombre AS tecnico,
             COUNT(m.id) AS total_movimientos,
             SUM(CASE WHEN m.tipo = 'SALIDA'     THEN m.cantidad ELSE 0 END) AS total_salidas,
             SUM(CASE WHEN m.tipo = 'DEVOLUCION' THEN m.cantidad ELSE 0 END) AS total_devoluciones,
             SUM(CASE WHEN m.tipo = 'SALIDA'     THEN m.cantidad ELSE 0 END)
               - SUM(CASE WHEN m.tipo = 'DEVOLUCION' THEN m.cantidad ELSE 0 END) AS neto_consumido
      FROM movimientos m JOIN usuarios t ON m.id_tecnico = t.id
      WHERE m.tipo IN ('SALIDA', 'DEVOLUCION')
    `;
    const paramsResumen = [];
    if (id_tecnico)   { sqlResumen += ' AND m.id_tecnico = ?';   paramsResumen.push(id_tecnico); }
    if (fecha_inicio) { sqlResumen += ' AND DATE(m.fecha) >= ?'; paramsResumen.push(fecha_inicio); }
    if (fecha_fin)    { sqlResumen += ' AND DATE(m.fecha) <= ?'; paramsResumen.push(fecha_fin); }
    sqlResumen += ' GROUP BY t.id, t.nombre ORDER BY neto_consumido DESC';

    let sqlDetalle = `
      SELECT t.id AS id_tecnico, t.nombre AS tecnico,
             p.nombre AS producto, c.nombre AS categoria, p.unidad_medida,
             SUM(CASE WHEN m.tipo = 'SALIDA'     THEN m.cantidad ELSE 0 END) AS salidas,
             SUM(CASE WHEN m.tipo = 'DEVOLUCION' THEN m.cantidad ELSE 0 END) AS devoluciones,
             SUM(CASE WHEN m.tipo = 'SALIDA'     THEN m.cantidad ELSE 0 END)
               - SUM(CASE WHEN m.tipo = 'DEVOLUCION' THEN m.cantidad ELSE 0 END) AS neto
      FROM movimientos m
      JOIN usuarios   t ON m.id_tecnico   = t.id
      JOIN productos  p ON m.id_producto  = p.id
      JOIN categorias c ON p.id_categoria = c.id
      WHERE m.tipo IN ('SALIDA', 'DEVOLUCION')
    `;
    const paramsDetalle = [];
    if (id_tecnico)   { sqlDetalle += ' AND m.id_tecnico = ?';   paramsDetalle.push(id_tecnico); }
    if (fecha_inicio) { sqlDetalle += ' AND DATE(m.fecha) >= ?'; paramsDetalle.push(fecha_inicio); }
    if (fecha_fin)    { sqlDetalle += ' AND DATE(m.fecha) <= ?'; paramsDetalle.push(fecha_fin); }
    sqlDetalle += ' GROUP BY t.id, t.nombre, p.id, p.nombre, c.nombre, p.unidad_medida ORDER BY t.nombre, neto DESC';

    const [[resumen], [detalle]] = await Promise.all([
      db.query(sqlResumen, paramsResumen),
      db.query(sqlDetalle, paramsDetalle),
    ]);
    return { resumen, detalle };
  },
};

module.exports = ReporteService;
