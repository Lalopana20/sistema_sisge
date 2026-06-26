const router       = require('express').Router();
const ctrl         = require('../controllers/auditoriaController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso } = require('../middlewares/permisoMiddleware');

// La auditoría respeta el sistema de permisos granulares — no solo soloAdmin
router.get('/', auth, verificarPermiso('auditoria', 'ver'), ctrl.listar);

module.exports = router;
