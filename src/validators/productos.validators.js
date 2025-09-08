const { body, query } = require('express-validator');
const { OPERATOR_KEYS } = require('../utils/sql'); // Operadores permitidos para comparaciones numéricas

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
// Cada parámetro en la query se valida y, si no se envía, se omite.
// El controlador aplicará '=' por defecto cuando haya valor pero falte operador.
const SORT_BY = ['id','nombre','precio','costo','stock','stock_minimo','localizacion'];
const SORT_DIR = ['asc', 'desc'];
const OPS = OPERATOR_KEYS; // ['eq','lte','gte']

exports.listFilters = [
  // Ordenación
  query('sortBy').optional({ checkFalsy: true }).toLowerCase().custom(v => SORT_BY.includes(v) ? v : undefined),
  query('sortDir').optional({ checkFalsy: true }).toLowerCase().custom(v => SORT_DIR.includes(v) ? v : undefined),
  // Búsqueda por nombre
  query('qName').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 200 }),
  // Comparaciones numéricas: operador y valor son independientes
  query('priceOp').optional({ checkFalsy: true }).isIn(OPS),
  query('price').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('stockOp').optional({ checkFalsy: true }).isIn(OPS),
  query('stock').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('minOp').optional({ checkFalsy: true }).isIn(OPS),
  query('min').optional({ checkFalsy: true }).isFloat().toFloat(),
  // Filtros por relaciones
  query('localizacionId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('categoriaId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('proveedorId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  // Flag para productos con stock < stock_minimo
  query('low').optional({ checkFalsy: true }).isIn(['1'])
];
