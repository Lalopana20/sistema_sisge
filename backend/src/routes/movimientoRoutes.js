const router       = require('express').Router();
const ctrl         = require('../controllers/movimientoController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const validateId   = require('../middlewares/validateIdMiddleware');
const Schemas      = require('../schemas/inventarioSchemas');

router.get('/',    auth, verificarPermiso('movimientos', 'ver'), ctrl.listar);
router.get('/:id', auth, verificarPermiso('movimientos', 'ver'), validateId, ctrl.obtener);
router.post('/',   auth, verificarPermiso('movimientos', 'crear'), validate(Schemas.crear), ctrl.registrar);
router.put('/:id', auth, verificarPermiso('movimientos', 'editar'), validateId, validate(Schemas.actualizar), ctrl.actualizar);

module.exports = router;
