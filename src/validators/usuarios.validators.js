const { body, query } = require('express-validator');
const pool = require('../config/db');

// Reglas comunes para campos de usuario (nombre, apellidos, email único, teléfono, rol válido)
const userRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre es obligatorio'),
  body('apellidos').trim().notEmpty().withMessage('Apellidos es obligatorio'),
  body('email')
    .isEmail().withMessage('Email inválido')
    .bail()
    .custom(async (email, { req }) => {
      const id = req.params?.id || 0; // Excluye al propio usuario en edición
      const [rows] = await pool.query('SELECT id FROM usuarios WHERE email=? AND id<>?', [email, id]);
      if (rows.length) throw new Error('Email ya registrado');
      return true;
    })
    .normalizeEmail(),
  body('telefono').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('rol_id').custom(async value => {
    const [rows] = await pool.query('SELECT id FROM roles WHERE id=?', [value]);
    if (!rows.length) throw new Error('Rol inválido');
    return true;
  })
];

// Validación de contraseña para alta de usuario: la longitud mínima viene del formulario
const newUserPasswordRules = () => [
  body('minLength').isInt({ min: 1 }).toInt(),
  body('password').custom((val, { req }) => {
    const min = parseInt(req.body.minLength, 10) || 8;
    if (!val || val.length < min) throw new Error(`Contraseña mínima de ${min} caracteres`);
    return true;
  }),
  body('passwordConfirm').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Las contraseñas no coinciden');
    return true;
  })
];

// Validación para cambio de contraseña: minLen configurable (por defecto 8)
const changePasswordRules = (minLen = 8) => [
  body('password').isLength({ min: minLen }).withMessage(`Contraseña mínima de ${minLen} caracteres`),
  body('passwordConfirm').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Las contraseñas no coinciden');
    return true;
  })
];

// Filtros opcionales para listado de usuarios
const SORT_BY = ['id', 'nombre', 'email', 'telefono', 'rol'];
const SORT_DIR = ['asc', 'desc'];

const listFilters = [
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

module.exports = {
  userRules,
  newUserPasswordRules,
  changePasswordRules,
  listFilters
};
// [checklist] validaciones y sanitizado
