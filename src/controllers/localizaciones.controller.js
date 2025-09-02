const pool = require('../config/db');
const { validationResult, body } = require('express-validator');

exports.list = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM localizaciones');
  res.render('pages/localizaciones/list', { localizaciones: rows });
};

exports.form = async (req, res) => {
  let localizacion = null;
  if (req.params.id) {
    const [rows] = await pool.query('SELECT * FROM localizaciones WHERE id=?', [req.params.id]);
    localizacion = rows[0];
  }
  res.render('pages/localizaciones/form', { localizacion, errors: [] });
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/localizaciones/form', { localizacion: null, errors: errors.array() });
  }
  await pool.query('INSERT INTO localizaciones (nombre) VALUES (?)', [req.body.nombre]);
  res.redirect('/localizaciones');
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/localizaciones/form', { localizacion: { id: req.params.id, nombre: req.body.nombre }, errors: errors.array() });
  }
  await pool.query('UPDATE localizaciones SET nombre=? WHERE id=?', [req.body.nombre, req.params.id]);
  res.redirect('/localizaciones');
};

exports.remove = async (req, res) => {
  await pool.query('DELETE FROM localizaciones WHERE id=?', [req.params.id]);
  res.redirect('/localizaciones');
};

exports.validator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio')
];
