const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validators');

/**
 * GET /login
 * Propósito: mostrar el formulario de acceso.
 * Entradas: ninguna.
 * Salidas: HTML renderizado con el formulario.
 * Validaciones: ninguna.
 * Manejo de errores: si la vista no existe, Express enviará 500.
 */
router.get('/login', controller.showLogin);

/**
 * POST /auth/login
 * Propósito: autenticar al usuario y crear la sesión.
 * Entradas: `email` y `password` en `req.body`.
 * Salidas: redirección a `/` o render de `/login` con errores.
 * Validaciones: `loginValidator` verifica formato de campos.
 * Manejo de errores: errores de validación o credenciales inválidas se devuelven como mensajes.
 */
router.post('/auth/login', loginValidator, controller.login);

/**
 * GET /auth/logout
 * Propósito: cerrar la sesión actual.
 * Entradas: ninguna.
 * Salidas: redirección a `/login`.
 * Validaciones: ninguna.
 * Manejo de errores: cualquier fallo al destruir la sesión se ignora.
 */
router.get('/auth/logout', controller.logout);

module.exports = router;
