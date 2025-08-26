const express = require('express');
const router = express.Router();
const controller = require('../controllers/localizaciones.controller');

router.get('/', controller.list);
router.get('/nuevo', controller.form);
router.post('/nuevo', controller.validator, controller.create);
router.get('/:id/editar', controller.form);
router.post('/:id/editar', controller.validator, controller.update);
router.get('/:id/eliminar', controller.remove);

module.exports = router;
