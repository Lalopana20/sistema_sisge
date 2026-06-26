const router       = require('express').Router();
const ctrl         = require('../controllers/usuarioController');
const auth         = require('../middlewares/authMiddleware');
const { soloAdmin, verificarPermiso } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const validateId   = require('../middlewares/validateIdMiddleware');
const Schemas      = require('../schemas/usuarioSchemas');

router.get('/',       auth, soloAdmin, ctrl.listar);
// /operarios: usado en formularios de movimientos y ubicaciones
// Requiere permiso de crear movimientos O ser admin/supervisor
router.get('/operarios', auth, verificarPermiso('movimientos', 'ver'), ctrl.listarOperarios);
router.get('/:id',    auth, soloAdmin, validateId, ctrl.obtener);
router.post('/',      auth, soloAdmin, validate(Schemas.crear), ctrl.crear);
router.put('/:id',    auth, soloAdmin, validateId, validate(Schemas.actualizar), ctrl.actualizar);
router.patch('/:id/estado', auth, soloAdmin, validateId, validate(Schemas.cambiarEstado), ctrl.cambiarEstado);
router.delete('/:id', auth, soloAdmin, validateId, ctrl.eliminar);

module.exports = router;
