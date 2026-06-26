/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD CONTROLLER - MEJORAS FASE C2
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Controlador extendido para el dashboard mejorado con KPIs avanzados,
 * gráficos interactivos y métricas en tiempo real.
 */

const DashboardService = require('../services/dashboardService');

const DashboardController = {
  /**
   * Obtener KPIs principales del dashboard
   * GET /api/dashboard/kpis
   */
  async getKpis(req, res, next) {
    try {
      const data = await DashboardService.getKpis();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtener datos para el gráfico de movimientos
   * GET /api/dashboard/movimientos?dias=30
   */
  async getMovimientos(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || 30;
      const data = await DashboardService.getMovimientos(dias);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtener stock por categoría para gráfico de barras
   * GET /api/dashboard/stock-categorias
   */
  async getStockCategorias(req, res, next) {
    try {
      const data = await DashboardService.getStockCategorias();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtener top N productos más usados
   * GET /api/dashboard/top-productos?limit=10&dias=30
   */
  async getTopProductos(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const dias = parseInt(req.query.dias) || 30;
      const data = await DashboardService.getTopProductos(limit, dias);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtener alertas activas del sistema
   * GET /api/dashboard/alertas
   */
  async getAlertas(req, res, next) {
    try {
      const data = await DashboardService.getAlertas();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtener resumen completo del dashboard
   * GET /api/dashboard/resumen
   */
  async getResumen(req, res, next) {
    try {
      const data = await DashboardService.getResumen();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DashboardController;
