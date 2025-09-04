const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const { createUserValidator, updateUserValidator, passwordValidator, listUsuariosValidator } = require('../validators/usuarios.validators');

// GET /usuarios - listado de usuarios
router.get('/', listUsuariosValidator, controller.list); // Listado

// GET /usuarios/nuevo - formulario de creación
router.get('/nuevo', controller.form); // Form crear

// POST /usuarios/nuevo - guardar usuario nuevo
router.post('/nuevo', createUserValidator, controller.create); // Guardar nuevo

// GET /usuarios/:id/editar - formulario de edición
router.get('/:id/editar', controller.form); // Form editar

// POST /usuarios/:id/editar - actualizar datos
router.post('/:id/editar', updateUserValidator, controller.update); // Actualizar

// GET /usuarios/:id/eliminar - borrar usuario
router.get('/:id/eliminar', controller.remove); // Eliminar

// GET /usuarios/:id/cambiar-password - formulario cambio contraseña
router.get('/:id/cambiar-password', controller.showChangePassword); // Form password

// POST /usuarios/:id/cambiar-password - actualizar contraseña
router.post('/:id/cambiar-password', passwordValidator, controller.changePassword); // Actualizar password

module.exports = router;
