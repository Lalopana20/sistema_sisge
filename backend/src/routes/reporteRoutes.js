const router       = require('express').Router();
const ctrl         = require('../controllers/reporteController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso } = require('../middlewares/permisoMiddleware');

router.get('/dashboard',      auth, verificarPermiso('reportes', 'ver'), ctrl.dashboard);
router.get('/dashboard-kpis', auth, verificarPermiso('reportes', 'ver'), ctrl.dashboardKpis);
router.get('/por-categoria',  auth, verificarPermiso('reportes', 'ver'), ctrl.porCategoria);
router.get('/por-producto',   auth, verificarPermiso('reportes', 'ver'), ctrl.porProducto);
router.get('/stock-bajo',     auth, verificarPermiso('reportes', 'ver'), ctrl.stockBajo);
// /por-tecnico — resumen de ubicaciones pendientes por técnico
router.get('/por-tecnico',    auth, verificarPermiso('reportes', 'ver'), ctrl.porTecnico);
// /consumo-tecnico — detalle de salidas/devoluciones por técnico con filtros de fecha e id
router.get('/consumo-tecnico', auth, verificarPermiso('reportes', 'ver'), ctrl.consumoPorTecnico);
router.get('/exportar',       auth, verificarPermiso('reportes', 'ver'), ctrl.exportar);

module.exports = router;
