const router       = require('express').Router();
const ctrl         = require('../controllers/productoController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso, soloAdmin } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const validateId   = require('../middlewares/validateIdMiddleware');
const Schemas      = require('../schemas/productoSchemas');

router.get('/stock-bajo',    auth, verificarPermiso('productos', 'ver'), ctrl.stockBajo);
router.get('/:id/historial', auth, verificarPermiso('productos', 'ver'), validateId, ctrl.historial);
router.patch('/:id/stock',   auth, verificarPermiso('productos', 'editar'), validateId, validate(Schemas.ajustarStock), ctrl.ajustarStock);
router.get('/',           auth, verificarPermiso('productos', 'ver'), ctrl.listar);
router.get('/:id',        auth, verificarPermiso('productos', 'ver'), validateId, ctrl.obtener);
router.post('/',          auth, verificarPermiso('productos', 'crear'), validate(Schemas.crear), ctrl.crear);
router.put('/:id',        auth, verificarPermiso('productos', 'editar'), validateId, validate(Schemas.actualizar), ctrl.actualizar);
router.delete('/:id',     auth, soloAdmin, validateId, ctrl.eliminar);

module.exports = router;
