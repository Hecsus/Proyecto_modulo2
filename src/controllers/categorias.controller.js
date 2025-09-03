const pool = require('../config/db');
const { validationResult, body } = require('express-validator');

// Listar categorías
exports.list = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categorias');
  res.render('pages/categorias/list', { title: 'Categorías', categorias: rows });
};

// Mostrar formulario
exports.form = async (req, res) => {
  let categoria = null;
  if (req.params.id) {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id=?', [req.params.id]);
    categoria = rows[0];
  }
  const title = req.params.id ? 'Editar categoría' : 'Nueva categoría';
  res.render('pages/categorias/form', { title, categoria, errors: [] });
};

// Crear
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/categorias/form', { title: 'Nueva categoría', categoria: null, errors: errors.array() });
  }
  await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [req.body.nombre]);
  res.redirect('/categorias');
};

// Actualizar
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/categorias/form', { title: 'Editar categoría', categoria: { id: req.params.id, nombre: req.body.nombre }, errors: errors.array() });
  }
  await pool.query('UPDATE categorias SET nombre=? WHERE id=?', [req.body.nombre, req.params.id]);
  res.redirect('/categorias');
};

// Eliminar
exports.remove = async (req, res) => {
  await pool.query('DELETE FROM categorias WHERE id=?', [req.params.id]);
  res.redirect('/categorias');
};

// Validator simple para nombre
exports.validator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio')
];
