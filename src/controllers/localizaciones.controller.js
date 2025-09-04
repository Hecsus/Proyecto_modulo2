const pool = require('../config/db');
const { validationResult, matchedData, body } = require('express-validator');

exports.list = async (req, res) => {
  const errors = validationResult(req); // Validación de filtros
  const data = matchedData(req, { locations: ['query'] }); // Datos saneados

  const SORTABLE = ['id', 'nombre'];                     // Columnas permitidas para ordenar
  const sortCol = SORTABLE.includes(data.sortBy) ? data.sortBy : 'id'; // Columna orden
  const sortDir = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // Dirección

  const clauses = [];                                    // Condiciones WHERE
  const params = [];                                     // Valores parametrizados
  if (data.id) { clauses.push('id = ?'); params.push(data.id); } // Filtro por id
  if (data.nombre) { clauses.push('nombre LIKE ?'); params.push(`%${data.nombre}%`); } // Filtro por nombre

  const whereSql = clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''; // Construcción WHERE
  const [rows] = await pool.query(`SELECT * FROM localizaciones ${whereSql} ORDER BY ${sortCol} ${sortDir}`, params); // Consulta
  res.render('pages/localizaciones/list', { title: 'Localizaciones', localizaciones: rows, errors: errors.array(), query: req.query }); // Render
};

exports.form = async (req, res) => {
  let localizacion = null;
  if (req.params.id) {
    const [rows] = await pool.query('SELECT * FROM localizaciones WHERE id=?', [req.params.id]);
    localizacion = rows[0];
  }
  const title = req.params.id ? 'Editar localización' : 'Nueva localización';
  res.render('pages/localizaciones/form', { title, localizacion, errors: [] });
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/localizaciones/form', { title: 'Nueva localización', localizacion: null, errors: errors.array() });
  }
  await pool.query('INSERT INTO localizaciones (nombre) VALUES (?)', [req.body.nombre]);
  res.redirect('/localizaciones');
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pages/localizaciones/form', { title: 'Editar localización', localizacion: { id: req.params.id, nombre: req.body.nombre }, errors: errors.array() });
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
