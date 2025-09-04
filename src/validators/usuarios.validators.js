const { body, query } = require('express-validator');
const pool = require('../config/db');

// Campos comunes para crear y editar
const baseFields = [
  body('nombre').notEmpty().withMessage('Nombre es obligatorio'),
  body('apellidos').notEmpty().withMessage('Apellidos es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefono').notEmpty().withMessage('Teléfono es obligatorio'),
  body('rol_id').custom(async value => {
    const [rows] = await pool.query('SELECT id FROM roles WHERE id=?', [value]);
    if (!rows.length) throw new Error('Rol inválido');
    return true;
  })
];

// Validaciones para creación
exports.createUserValidator = [
  ...baseFields,
  body('password').isLength({ min: 8 }).withMessage('Contraseña mínima de 8 caracteres')
];

// Validaciones para edición
exports.updateUserValidator = baseFields;

// Validación para cambiar contraseña
exports.passwordValidator = [
  body('password').isLength({ min: 8 }).withMessage('Contraseña mínima de 8 caracteres')
];

// Filtros opcionales para listado
const SORT_BY = ['id', 'nombre', 'email', 'telefono', 'rol'];
const SORT_DIR = ['asc', 'desc'];

exports.listFilters = [
  query('id').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('nombre').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }),
  query('email').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }),
  query('telefono').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 20 }),
  query('rol').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 50 }),
  query('sortBy').optional({ checkFalsy: true }).isIn(SORT_BY),
  query('sortDir').optional({ checkFalsy: true }).isIn(SORT_DIR),
  query('page').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query('pageSize').optional({ checkFalsy: true }).isInt({ min: 1, max: 200 }).toInt()
];
