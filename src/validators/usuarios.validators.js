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
exports.listUsuariosValidator = [
  query('id').optional({ checkFalsy: true }).isInt().withMessage('ID inválido'),
  query('nombre').optional({ checkFalsy: true }),
  query('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  query('rol').optional({ checkFalsy: true }).custom(async value => {
    const [rows] = await pool.query('SELECT nombre FROM roles WHERE nombre=?', [value]);
    if (!rows.length) throw new Error('Rol inválido');
    return true;
  }),
  query('telefono').optional({ checkFalsy: true }),
  query('sortBy').optional({ checkFalsy: true }).isIn(['id', 'nombre', 'email', 'rol', 'telefono']),
  query('sortDir').optional({ checkFalsy: true }).isIn(['asc', 'desc'])
];
