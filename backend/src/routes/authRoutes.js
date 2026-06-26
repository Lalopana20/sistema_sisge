const router       = require('express').Router();
const ctrl         = require('../controllers/authController');
const validate     = require('../middlewares/validateMiddleware');
const auth         = require('../middlewares/authMiddleware');
const { soloAdmin } = require('../middlewares/permisoMiddleware');
const { loginLimiter, strictLimiter } = require('../middlewares/rateLimitMiddleware');
const AuthSchemas  = require('../schemas/authSchemas');

router.post('/login',    loginLimiter, validate(AuthSchemas.login),    ctrl.login);
router.post('/logout',   auth,         ctrl.logout);
router.get('/me',        auth,         ctrl.me);
router.patch('/password', auth, strictLimiter, validate(AuthSchemas.password), ctrl.cambiarPassword);
router.post('/registrar', auth, soloAdmin, validate(AuthSchemas.registro), ctrl.registrar);

module.exports = router;
