const router       = require('express').Router();
const ctrl         = require('../controllers/notificacionController');
const auth         = require('../middlewares/authMiddleware');
const { soloAdmin } = require('../middlewares/permisoMiddleware');
const validate     = require('../middlewares/validateMiddleware');
const Schemas      = require('../schemas/notificacionSchemas');

router.get('/',           auth, ctrl.listar);
router.get('/no-leidas',  auth, ctrl.noLeidas);
router.post('/',          auth, soloAdmin, validate(Schemas.crear), ctrl.crear);
router.patch('/:id',      auth, ctrl.marcarLeida);
router.patch('/',         auth, ctrl.marcarTodasLeidas);

module.exports = router;
