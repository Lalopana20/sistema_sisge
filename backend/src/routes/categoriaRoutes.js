const router       = require('express').Router();
const ctrl         = require('../controllers/categoriaController');
const subcategoriaCtrl = require('../controllers/subcategoriaController');
const auth         = require('../middlewares/authMiddleware');
const { verificarPermiso, soloAdmin } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const validateId   = require('../middlewares/validateIdMiddleware');
const Schemas      = require('../schemas/categoriaSchemas');

router.get('/',       auth, verificarPermiso('categorias', 'ver'), ctrl.listar);
router.get('/:id',    auth, verificarPermiso('categorias', 'ver'), validateId, ctrl.obtener);
router.get('/:id/subcategorias', auth, verificarPermiso('subcategorias', 'ver'), validateId, (req, _res, next) => {
  req.query.id_categoria = req.params.id;
  next();
}, subcategoriaCtrl.listar);
router.post('/',      auth, verificarPermiso('categorias', 'crear'), validate(Schemas.upsert), ctrl.crear);
router.put('/:id',    auth, verificarPermiso('categorias', 'editar'), validateId, validate(Schemas.upsert), ctrl.actualizar);
router.delete('/:id', auth, soloAdmin, validateId, ctrl.eliminar);

module.exports = router;
