/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD ROUTES - MEJORAS FASE C2
 * ═══════════════════════════════════════════════════════════════════════════
 */

const router = require('express').Router();
const DashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');
const { verificarPermiso } = require('../middlewares/permisoMiddleware');

// Todas las rutas requieren autenticación + permiso dashboard.ver
router.use(auth, verificarPermiso('dashboard', 'ver'));

// GET /api/dashboard/kpis - KPIs principales
router.get('/kpis', DashboardController.getKpis);

// GET /api/dashboard/movimientos?dias=30 - Datos para gráfico de movimientos
router.get('/movimientos', DashboardController.getMovimientos);

// GET /api/dashboard/stock-categorias - Stock por categoría
router.get('/stock-categorias', DashboardController.getStockCategorias);

// GET /api/dashboard/top-productos?limit=10&dias=30 - Top productos
router.get('/top-productos', DashboardController.getTopProductos);

// GET /api/dashboard/alertas - Alertas activas
router.get('/alertas', DashboardController.getAlertas);

// GET /api/dashboard/resumen - Resumen completo
router.get('/resumen', DashboardController.getResumen);

module.exports = router;
