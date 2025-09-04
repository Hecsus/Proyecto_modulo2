const pool = require('../config/db');
const { validationResult, matchedData, body } = require('express-validator');

exports.list = async (req, res) => {
  const errors = validationResult(req); // Validación de filtros
  const data = matchedData(req, { locations: ['query'] }); // Datos saneados

  const SORTABLE = ['id', 'nombre'];                     // Columnas ordenables
  const sortCol = SORTABLE.includes(data.sortBy) ? data.sortBy : 'id'; // Columna final
  const sortDir = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // Dirección

  const clauses = [];                                    // Condiciones WHERE
  const params = [];                                     // Valores parametrizados
  if (data.id) { clauses.push('id = ?'); params.push(data.id); } // Filtro por id
  if (data.nombre) { clauses.push('nombre LIKE ?'); params.push(`%${data.nombre}%`); } // Filtro por nombre

  const whereSql = clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''; // Construcción WHERE
  const [rows] = await pool.query(`SELECT * FROM proveedores ${whereSql} ORDER BY ${sortCol} ${sortDir}`, params); // Consulta
  res.render('pages/proveedores/list', { title: 'Proveedores', proveedores: rows, errors: errors.array(), query: req.query }); // Render
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
