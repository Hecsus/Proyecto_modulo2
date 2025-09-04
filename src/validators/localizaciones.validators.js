const { query } = require('express-validator');

exports.listLocalizacionesValidator = [
  query('id').optional({ checkFalsy: true }).isInt().withMessage('ID inválido'),
  query('nombre').optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage('Nombre demasiado largo'),
  query('sortBy').optional({ checkFalsy: true }).isIn(['id', 'nombre']),
  query('sortDir').optional({ checkFalsy: true }).isIn(['asc', 'desc'])
];
