const { query } = require('express-validator');
const { OPERATOR_KEYS } = require('../utils/sql'); // Operadores válidos para comparaciones

// Filtros opcionales para listado de bajo stock
const SORT_BY = ['id', 'nombre', 'precio', 'stock', 'stock_minimo'];
const SORT_DIR = ['asc', 'desc'];
const OPS = OPERATOR_KEYS; // ['eq','lte','gte']

// Validaciones para filtros opcionales del listado de bajo stock
// Cada parámetro se ignora si no se envía; el controlador aplicará '=' por defecto para comparaciones numéricas.
exports.listFilters = [
  // Ordenación
  query('sortBy').optional({ checkFalsy: true }).toLowerCase().custom(v => SORT_BY.includes(v) ? v : undefined),
  query('sortDir').optional({ checkFalsy: true }).toLowerCase().custom(v => SORT_DIR.includes(v) ? v : undefined),
  // Búsqueda por nombre
  query('qName').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 200 }),
  // Comparaciones numéricas
  query('priceOp').optional({ checkFalsy: true }).isIn(OPS),
  query('price').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('stockOp').optional({ checkFalsy: true }).isIn(OPS),
  query('stock').optional({ checkFalsy: true }).isFloat().toFloat(),
  query('minOp').optional({ checkFalsy: true }).isIn(OPS),
  query('min').optional({ checkFalsy: true }).isFloat().toFloat(),
  // Filtros por relaciones
  query('localizacionId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('categoriaId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('proveedorId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt()
];
