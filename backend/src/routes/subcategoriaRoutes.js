const router       = require('express').Router();
const ctrl         = require('../controllers/subcategoriaController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso, soloAdmin } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const validateId   = require('../middlewares/validateIdMiddleware');
const Schemas      = require('../schemas/subcategoriaSchemas');

router.get('/',       auth, verificarPermiso('subcategorias', 'ver'), ctrl.listar);
router.get('/:id',    auth, verificarPermiso('subcategorias', 'ver'), validateId, ctrl.obtener);
router.post('/',      auth, verificarPermiso('subcategorias', 'crear'), validate(Schemas.upsert), ctrl.crear);
router.put('/:id',    auth, verificarPermiso('subcategorias', 'editar'), validateId, validate(Schemas.upsert), ctrl.actualizar);
router.delete('/:id', auth, soloAdmin, validateId, ctrl.eliminar);

module.exports = router;
