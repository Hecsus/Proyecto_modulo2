const pool = require('../config/db');
const { validationResult, matchedData, body } = require('express-validator');

// Listar categorías
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

  const whereSql = clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''; // Construcción del WHERE
  const [rows] = await pool.query(`SELECT * FROM categorias ${whereSql} ORDER BY ${sortCol} ${sortDir}`, params); // Consulta
  res.render('pages/categorias/list', { title: 'Categorías', categorias: rows, errors: errors.array(), query: req.query }); // Render
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
