const { body, query } = require('express-validator');

// Validaciones para crear/editar productos
exports.productValidator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ gt: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
  body('stock_minimo').isInt({ min: 0 }).withMessage('Stock mínimo inválido'),
  body('localizacion_id').isInt().withMessage('Seleccione una localización válida')
];

// Validaciones para filtros y ordenación de listados
exports.productListValidator = [
  query('sortBy').optional().isIn(['id', 'nombre', 'precio', 'stock', 'stock_minimo']),
  query('sortDir').optional().isIn(['asc', 'desc']),
  query('qName').optional().isString().trim().escape(),
  query('priceOp').optional().isIn(['eq', 'lte', 'gte']),
  query('price').optional().isFloat(),
  query('stockOp').optional().isIn(['eq', 'lte', 'gte']),
  query('stock').optional().isInt(),
  query('minOp').optional().isIn(['eq', 'lte', 'gte']),
  query('min').optional().isInt(),
  query('localizacionId').optional().isInt({ min: 1 }),
  query('categoriaId').optional().isInt({ min: 1 }),
  query('proveedorId').optional().isInt({ min: 1 }),
  query('low').optional().isInt({ min: 1, max: 1 })
];
