const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/permisoController');
const auth     = require('../middlewares/authMiddleware');
const { soloAdmin } = require('../middlewares/permisoMiddleware');
const validate = require('../middlewares/validateMiddleware');
const Joi      = require('joi');

// ── Schemas de validación inline ─────────────────────────────────────────────
const schemaRol = Joi.object({
  rol:           Joi.string().valid('admin','supervisor','operario').required(),
  modulo:        Joi.string().min(2).required(),
  puede_ver:     Joi.boolean().default(false),
  puede_crear:   Joi.boolean().default(false),
  puede_editar:  Joi.boolean().default(false),
  puede_eliminar:Joi.boolean().default(false),
});

const schemaUsuario = Joi.object({
  modulo:        Joi.string().min(2).required(),
  puede_ver:     Joi.boolean().default(false),
  puede_crear:   Joi.boolean().default(false),
  puede_editar:  Joi.boolean().default(false),
  puede_eliminar:Joi.boolean().default(false),
  motivo:        Joi.string().max(200).allow('', null).optional(),
});

// ── Rutas ─────────────────────────────────────────────────────────────────────

// Lista de módulos del sistema
router.get('/modulos', auth, ctrl.listarModulos);

// Mis permisos efectivos (cualquier usuario autenticado)
router.get('/mis-permisos', auth, ctrl.obtenerMisPermisos);

// Permisos de todos los roles (solo admin)
router.get('/', auth, soloAdmin, ctrl.listarTodos);

// Actualizar permiso de un ROL (solo admin)
router.put('/', auth, soloAdmin, validate(schemaRol), ctrl.actualizar);

// Permisos individuales de un usuario específico
router.get('/usuario/:id',                    auth, soloAdmin, ctrl.obtenerPermisosUsuario);
router.put('/usuario/:id',                    auth, soloAdmin, validate(schemaUsuario), ctrl.guardarPermisoUsuario);
router.delete('/usuario/:id/modulo/:modulo',  auth, soloAdmin, ctrl.eliminarPermisoUsuario);
router.delete('/usuario/:id/reset',           auth, soloAdmin, ctrl.resetearPermisosUsuario);

module.exports = router;
