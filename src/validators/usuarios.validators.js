const { body } = require('express-validator');
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
