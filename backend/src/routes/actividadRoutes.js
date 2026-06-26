const router = require('express').Router();
const ctrl   = require('../controllers/actividadController');
const auth   = require('../middlewares/authMiddleware');

router.get('/', auth, ctrl.listar);

module.exports = router;
