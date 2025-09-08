const express = require('express');
const router = express.Router();
const controller = require('../controllers/bajo-stock.controller');
const { listFilters } = require('../validators/bajo-stock.validators');

router.get('/', listFilters, controller.list); // Listado bajo stock

module.exports = router;
