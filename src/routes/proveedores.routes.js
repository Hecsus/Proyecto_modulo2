const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedores.controller');
// Validaciones de filtros
const { listFilters } = require('../validators/proveedores.validators');
const requireRole = require('../middlewares/requireRole'); // Solo admin modifica

// Listado con filtros
router.get('/', listFilters, controller.list);
router.get('/nuevo', requireRole('admin'), controller.form);
router.post('/nuevo', requireRole('admin'), controller.validator, controller.create);
router.get('/:id/editar', requireRole('admin'), controller.form);
router.post('/:id/editar', requireRole('admin'), controller.validator, controller.update);
router.get('/:id/eliminar', requireRole('admin'), controller.remove);

module.exports = router;
