const router       = require('express').Router();
const ctrl         = require('../controllers/configuracionController');
const auth         = require('../middlewares/authMiddleware');
const { soloAdmin } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const Schemas      = require('../schemas/configuracionSchemas');

router.get('/',         auth, ctrl.listar);
router.get('/:clave',   auth, ctrl.obtener);
router.post('/',        auth, soloAdmin, validate(Schemas.crear), ctrl.crear);
router.put('/:id',      auth, soloAdmin, validate(Schemas.actualizar), ctrl.actualizar);
router.delete('/:id',   auth, soloAdmin, ctrl.eliminar);

module.exports = router;
