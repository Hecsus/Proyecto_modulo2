const express = require('express');
const router = express.Router();
const controller = require('../controllers/bajo-stock.controller');
const { productListValidator } = require('../validators/productos.validators');

router.get('/', productListValidator, controller.list); // Listado bajo stock

module.exports = router;
