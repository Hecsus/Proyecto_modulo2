const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');
const { productValidator } = require('../validators/productos.validators');

router.get('/', controller.list);                      // Listado
router.get('/bajo-stock', controller.bajoStock);       // Productos con stock bajo
router.get('/nuevo', controller.form);                 // Form crear
router.post('/nuevo', productValidator, controller.create); // Guardar nuevo
router.get('/:id/editar', controller.form);            // Form editar
router.post('/:id/editar', productValidator, controller.update); // Actualizar
router.get('/:id/eliminar', controller.remove);        // Eliminar
router.get('/:id', controller.detail);                 // Detalle

module.exports = router;
