const express = require('express');
const router = express.Router();
const controller = require('../controllers/categorias.controller');
// Validaciones de filtros opcionales
const { listFilters } = require('../validators/categorias.validators');
const requireRole = require('../middlewares/requireRole'); // Rutas protegidas para admin

// Listado con filtros combinables
router.get('/', listFilters, controller.list);
router.get('/nuevo', requireRole('admin'), controller.form);
router.post('/nuevo', requireRole('admin'), controller.validator, controller.create);
router.get('/:id/editar', requireRole('admin'), controller.form);
router.post('/:id/editar', requireRole('admin'), controller.validator, controller.update);
router.get('/:id/eliminar', requireRole('admin'), controller.remove);

module.exports = router;
