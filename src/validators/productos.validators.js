const { body, query } = require('express-validator');

// Validaciones para crear/editar productos
exports.productValidator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ gt: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
  body('stock_minimo').isInt({ min: 0 }).withMessage('Stock mínimo inválido'),
  body('localizacion_id').isInt().withMessage('Seleccione una localización válida'),
  // Arrays de IDs de categorías y proveedores, opcionales
  body('categorias').optional({ checkFalsy: true }).isArray().withMessage('Categorías inválidas'),
  body('categorias.*').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  body('proveedores').optional({ checkFalsy: true }).isArray().withMessage('Proveedores inválidos'),
  body('proveedores.*').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt()
];

// Filtros opcionales para listados de productos
const SORT_BY = ['id', 'nombre', 'precio', 'stock', 'stock_minimo'];
const SORT_DIR = ['asc', 'desc'];
const OPS = ['eq', 'lte', 'gte'];

exports.listFilters = [
  query('sortBy').optional({ checkFalsy: true }).toLowerCase().custom(v => SORT_BY.includes(v) ? v : undefined),
  query('sortDir').optional({ checkFalsy: true }).toLowerCase().custom(v => SORT_DIR.includes(v) ? v : undefined),
  query('qName').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 200 }),
  query('priceOp').optional({ checkFalsy: true }).isIn(OPS),
  query('price').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('stockOp').optional({ checkFalsy: true }).isIn(OPS),
  query('stock').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('minOp').optional({ checkFalsy: true }).isIn(OPS),
  query('min').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('localizacionId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('categoriaId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('proveedorId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('low').optional({ checkFalsy: true }).isIn(['1'])
];
