const { body } = require('express-validator');

// Validaciones para crear/editar productos
exports.productValidator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ gt: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
  body('stock_minimo').isInt({ min: 0 }).withMessage('Stock mínimo inválido'),
  body('localizacion_id').isInt().withMessage('Seleccione una localización válida')
];
