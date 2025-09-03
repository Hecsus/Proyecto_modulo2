const pool = require('../config/db');
const { validationResult, body } = require('express-validator');

exports.list = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM proveedores');
  res.render('pages/proveedores/list', { title: 'Proveedores', proveedores: rows });
};

exports.form = async (req, res) => {
  let proveedor = null;
  if (req.params.id) {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id=?', [req.params.id]);
    proveedor = rows[0];
  }
  const title = req.params.id ? 'Editar proveedor' : 'Nuevo proveedor';
  res.render('pages/proveedores/form', { title, proveedor, errors: [] });
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/proveedores/form', { title: 'Nuevo proveedor', proveedor: null, errors: errors.array() });
  }
  await pool.query('INSERT INTO proveedores (nombre) VALUES (?)', [req.body.nombre]);
  res.redirect('/proveedores');
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/proveedores/form', { title: 'Editar proveedor', proveedor: { id: req.params.id, nombre: req.body.nombre }, errors: errors.array() });
  }
  await pool.query('UPDATE proveedores SET nombre=? WHERE id=?', [req.body.nombre, req.params.id]);
  res.redirect('/proveedores');
};

exports.remove = async (req, res) => {
  await pool.query('DELETE FROM proveedores WHERE id=?', [req.params.id]);
  res.redirect('/proveedores');
};

exports.validator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio')
];
