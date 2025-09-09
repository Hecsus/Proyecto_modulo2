const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');
const { productValidator, listFilters } = require('../validators/productos.validators');
const requireRole = require('../middlewares/requireRole'); // Solo admin puede modificar

router.get('/', listFilters, controller.list); // Listado con filtros
router.get('/nuevo', requireRole('admin'), controller.form);                 // Form crear (solo admin)
router.post('/nuevo', requireRole('admin'), productValidator, controller.create); // Guardar nuevo
router.get('/:id/editar', requireRole('admin'), controller.form);            // Form editar (solo admin)
router.post('/:id/editar', requireRole('admin'), productValidator, controller.update); // Actualizar (solo admin)
router.get('/:id/eliminar', requireRole('admin'), controller.remove);        // Eliminar (solo admin)
router.get('/:id', controller.detail);                 // Detalle

module.exports = router;
