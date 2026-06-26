const router       = require('express').Router();
const ctrl         = require('../controllers/ubicacionController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso, soloAdmin } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const validateId   = require('../middlewares/validateIdMiddleware');
const Schemas      = require('../schemas/ubicacionSchemas');

router.get('/alertas',        auth, verificarPermiso('ubicaciones', 'ver'), ctrl.alertas);
router.get('/alertas/conteo', auth, verificarPermiso('ubicaciones', 'ver'), ctrl.conteoAlertas);
router.get('/',               auth, verificarPermiso('ubicaciones', 'ver'), ctrl.listar);
router.get('/:id',            auth, verificarPermiso('ubicaciones', 'ver'), validateId, ctrl.obtener);
router.post('/',              auth, verificarPermiso('ubicaciones', 'crear'), validate(Schemas.crear), ctrl.crear);
router.put('/:id',            auth, verificarPermiso('ubicaciones', 'editar'), validateId, validate(Schemas.actualizar), ctrl.actualizar);
router.delete('/:id',         auth, soloAdmin, validateId, ctrl.eliminar);
router.patch('/:id/cerrar',   auth, verificarPermiso('ubicaciones', 'editar'), validateId, validate(Schemas.cerrar), ctrl.cerrar);

module.exports = router;
