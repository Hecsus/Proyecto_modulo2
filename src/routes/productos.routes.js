const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');
const { productValidator, listFilters } = require('../validators/productos.validators');
const requireAuth = require('../middlewares/requireAuth'); // Exige sesión iniciada

// Listado de productos con filtros combinables
router.get('/', requireAuth, listFilters, controller.list);
// Formulario de creación de productos
router.get('/nuevo', requireAuth, controller.form);
// Guardar producto nuevo
router.post('/nuevo', requireAuth, productValidator, controller.create);
// Formulario de edición de producto existente
router.get('/:id/editar', requireAuth, controller.form);
// Actualizar producto
router.post('/:id/editar', requireAuth, productValidator, controller.update);
// Eliminar producto
router.post('/:id/eliminar', requireAuth, controller.remove);
// Detalle de producto
router.get('/:id', requireAuth, controller.detail);

module.exports = router;
// [checklist] permiso correcto, validaciones y SQL seguro
