const { query } = require('express-validator');

// Filtros opcionales para listado de bajo stock
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
  query('proveedorId').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt()
];
