/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD SERVICE - MEJORAS FASE C2
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Servicio con lógica de negocio para el dashboard mejorado.
 * Incluye KPIs avanzados, gráficos y métricas en tiempo real.
 */

const db = require('../config/db');

const DashboardService = {
  /**
   * Obtener KPIs principales del dashboard
   */
  async getKpis() {
    // 1. Valor total del inventario
    // Verificar si precio_unitario existe (puede no estar en instalaciones sin migración)
    let valorInventario = { valor_total: 0 };
    try {
      [[valorInventario]] = await db.query(`
        SELECT COALESCE(SUM(stock_actual * COALESCE(precio_unitario, 0)), 0) as valor_total
        FROM productos
        WHERE activo = 1
      `);
    } catch (err) {
      // Si precio_unitario no existe, calcular solo con stock_actual
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        [[valorInventario]] = await db.query(`
          SELECT 0 as valor_total FROM dual
        `);
      } else {
        throw err;
      }
    }

    // 2. Total de productos activos
    const [[totalProductos]] = await db.query(`
      SELECT COUNT(*) as total
      FROM productos
      WHERE activo = 1
    `);

    // 3. Productos con stock bajo
    const [[stockBajo]] = await db.query(`
      SELECT COUNT(*) as total
      FROM productos
      WHERE stock_actual <= stock_minimo
      AND activo = 1
    `);

    // 4. Material vencido (>7 días sin devolver)
    const [[materialVencido]] = await db.query(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM ubicaciones_material u
      JOIN movimientos m ON u.id_movimiento = m.id
      WHERE u.estado != 'DEVUELTO'
      AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= 7
    `);

    // 5. Total de movimientos hoy
    const [[movimientosHoy]] = await db.query(`
      SELECT COUNT(*) as total
      FROM movimientos
      WHERE DATE(fecha) = CURDATE()
    `);

    // 6. Total de ubicaciones activas
    const [[ubicacionesActivas]] = await db.query(`
      SELECT COUNT(*) as total
      FROM ubicaciones_material
      WHERE estado != 'DEVUELTO'
    `);

    // 7. Total items en stock (suma de todos los stock_actual)
    const [[totalItemsStock]] = await db.query(`
      SELECT COALESCE(SUM(stock_actual), 0) as total
      FROM productos
      WHERE activo = 1
    `);

    // 8. Comparaciones (cambio vs período anterior - simplificado)
    // Para una implementación completa, se calcularían los mismos valores para ayer/semana pasada
    
    return {
      valor_inventario: parseFloat(valorInventario.valor_total) || 0,
      valor_inventario_cambio: 0, // TODO: Calcular cambio real
      total_productos: parseInt(totalProductos.total) || 0,
      productos_nuevos: 0, // TODO: Productos agregados esta semana
      stock_bajo: parseInt(stockBajo.total) || 0,
      stock_bajo_cambio: 0, // TODO: Calcular cambio
      material_vencido: parseInt(materialVencido.total) || 0,
      material_vencido_cambio: 0, // TODO: Calcular cambio
      movimientos_hoy: parseInt(movimientosHoy.total) || 0,
      ubicaciones_activas: parseInt(ubicacionesActivas.total) || 0,
      total_items_stock: parseInt(totalItemsStock.total) || 0,
    };
  },

  /**
   * Obtener datos para el gráfico de movimientos por día
   * @param {number} dias - Número de días hacia atrás (7, 15, 30, 60, 90)
   */
  async getMovimientos(dias = 30) {
    const [rows] = await db.query(`
      SELECT 
        DATE(fecha) as fecha,
        tipo,
        COUNT(*) as cantidad,
        SUM(cantidad) as total_unidades
      FROM movimientos
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(fecha), tipo
      ORDER BY DATE(fecha) ASC, tipo
    `, [dias]);

    // Transformar a formato para el gráfico
    // Agrupar por fecha y separar por tipo
    const fechasMap = {};
    
    rows.forEach(row => {
      const fecha = row.fecha;
      if (!fechasMap[fecha]) {
        fechasMap[fecha] = {
          fecha,
          ENTRADA: 0,
          SALIDA: 0,
          DEVOLUCION: 0,
          AJUSTE: 0,
        };
      }
      fechasMap[fecha][row.tipo] = parseInt(row.cantidad) || 0;
    });

    // Completar días faltantes con 0
    const resultado = [];
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      resultado.push(fechasMap[fechaStr] || {
        fecha: fechaStr,
        ENTRADA: 0,
        SALIDA: 0,
        DEVOLUCION: 0,
        AJUSTE: 0,
      });
    }

    return resultado;
  },

  /**
   * Obtener stock por categoría con porcentajes
   */
  async getStockCategorias() {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.nombre as categoria,
        COUNT(p.id) as total_productos,
        COALESCE(SUM(p.stock_actual), 0) as stock_actual,
        COALESCE(SUM(p.stock_minimo), 0) as stock_minimo,
        CASE 
          WHEN SUM(p.stock_minimo) > 0 
          THEN ROUND((SUM(p.stock_actual) / SUM(p.stock_minimo)) * 100, 1)
          ELSE 100
        END as porcentaje,
        COUNT(CASE WHEN p.stock_actual <= p.stock_minimo THEN 1 END) as productos_bajo_stock
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.id_categoria AND p.activo = 1
      WHERE c.activo = 1
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre
    `);

    return rows.map(row => ({
      id: row.id,
      categoria: row.categoria,
      total_productos: parseInt(row.total_productos) || 0,
      stock_actual: parseInt(row.stock_actual) || 0,
      stock_minimo: parseInt(row.stock_minimo) || 0,
      porcentaje: parseFloat(row.porcentaje) || 0,
      productos_bajo_stock: parseInt(row.productos_bajo_stock) || 0,
      estado: row.porcentaje >= 70 ? 'bueno' : row.porcentaje >= 40 ? 'medio' : 'critico',
    }));
  },

  /**
   * Obtener top N productos más usados
   * @param {number} limit - Cantidad de productos a retornar
   * @param {number} dias - Período en días
   */
  async getTopProductos(limit = 10, dias = 30) {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.nombre,
        c.nombre as categoria,
        COUNT(m.id) as total_movimientos,
        SUM(m.cantidad) as cantidad_total,
        MAX(m.fecha) as ultimo_movimiento
      FROM productos p
      INNER JOIN movimientos m ON p.id = m.id_producto
      LEFT JOIN categorias c ON p.id_categoria = c.id
      WHERE m.fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      AND p.activo = 1
      GROUP BY p.id, p.nombre, c.nombre
      ORDER BY total_movimientos DESC, cantidad_total DESC
      LIMIT ?
    `, [dias, limit]);

    return rows.map((row, index) => ({
      posicion: index + 1,
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      total_movimientos: parseInt(row.total_movimientos) || 0,
      cantidad_total: parseInt(row.cantidad_total) || 0,
      ultimo_movimiento: row.ultimo_movimiento,
      tendencia: 0,
    }));
  },

  /**
   * Obtener alertas activas del sistema
   */
  async getAlertas() {
    // 1. Productos con stock bajo
    const [[stockBajo]] = await db.query(`
      SELECT COUNT(*) as total
      FROM productos
      WHERE stock_actual <= stock_minimo
      AND activo = 1
    `);

    // 2. Material vencido sin devolver
    const [[materialVencido]] = await db.query(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM ubicaciones_material u
      JOIN movimientos m ON u.id_movimiento = m.id
      WHERE u.estado != 'DEVUELTO'
      AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= 7
    `);

    // 3. Productos sin movimiento en 30+ días
    const [[sinMovimiento]] = await db.query(`
      SELECT COUNT(*) as total
      FROM productos p
      WHERE p.activo = 1
      AND NOT EXISTS (
        SELECT 1 FROM movimientos m
        WHERE m.id_producto = p.id
        AND m.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      )
    `);

    // 4. Devoluciones pendientes (ubicaciones activas)
    const [[devolucionesPendientes]] = await db.query(`
      SELECT COUNT(*) as total
      FROM ubicaciones_material
      WHERE estado IN ('EN_USO', 'EN_OBRA', 'PENDIENTE_DEV')
    `);

    // 5. Material crítico (stock = 0)
    const [[stockCero]] = await db.query(`
      SELECT COUNT(*) as total
      FROM productos
      WHERE stock_actual = 0
      AND activo = 1
    `);

    return {
      stock_bajo: parseInt(stockBajo.total) || 0,
      material_vencido: parseInt(materialVencido.total) || 0,
      sin_movimiento: parseInt(sinMovimiento.total) || 0,
      devoluciones_pendientes: parseInt(devolucionesPendientes.total) || 0,
      stock_cero: parseInt(stockCero.total) || 0,
      total_alertas: 
        (parseInt(stockBajo.total) || 0) +
        (parseInt(materialVencido.total) || 0) +
        (parseInt(stockCero.total) || 0),
    };
  },

  /**
   * Obtener resumen completo (combina todos los datos)
   */
  async getResumen() {
    const [kpis, movimientos, stockCategorias, topProductos, alertas] = await Promise.all([
      this.getKpis(),
      this.getMovimientos(30),
      this.getStockCategorias(),
      this.getTopProductos(10, 30),
      this.getAlertas(),
    ]);

    return {
      kpis,
      movimientos,
      stock_categorias: stockCategorias,
      top_productos: topProductos,
      alertas,
    };
  },
};

module.exports = DashboardService;
