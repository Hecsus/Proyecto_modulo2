const express = require('express');
const router = express.Router();
const controller = require('../controllers/bajo-stock.controller');
const { listFilters } = require('../validators/bajo-stock.validators');
const requireAuth = require('../middlewares/requireAuth'); // Inventario visible solo autenticado

// Listado de productos en bajo stock
router.get('/', requireAuth, listFilters, controller.list);

module.exports = router;
// [checklist] permiso correcto, validaciones y SQL seguro
