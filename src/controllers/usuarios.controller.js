const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult, matchedData } = require('express-validator');

// Listar usuarios con filtros opcionales
exports.list = async (req, res) => {
  const errors = validationResult(req);                              // Resultado de validaciones
  const data = matchedData(req, { locations: ['query'] });           // Datos saneados

  const SORTABLE = {                                                // Columnas permitidas para ORDER BY
    id: 'u.id',
    nombre: 'u.nombre',
    email: 'u.email',
    rol: 'r.nombre',
    telefono: 'u.telefono'
  };
  const sortCol = SORTABLE[data.sortBy] || 'u.id';                  // Columna ordenada
  const sortDir = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // Dirección

  const clauses = [];                                               // Condiciones WHERE
  const params = [];                                                // Valores parametrizados
  if (data.id) { clauses.push('u.id = ?'); params.push(data.id); }
  if (data.nombre) { clauses.push('u.nombre LIKE ?'); params.push(`%${data.nombre}%`); }
  if (data.email) { clauses.push('u.email LIKE ?'); params.push(`%${data.email}%`); }
  if (data.rol) { clauses.push('r.nombre = ?'); params.push(data.rol); }
  if (data.telefono) { clauses.push('u.telefono LIKE ?'); params.push(`%${data.telefono}%`); }

  const whereSql = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, r.nombre AS rol FROM usuarios u JOIN roles r ON u.rol_id = r.id ${whereSql} ORDER BY ${sortCol} ${sortDir}`,
    params
  );
  const message = req.session.message;                             // Mensajes de sesión previos
  delete req.session.message;                                      // Se muestran una sola vez
  res.render('pages/usuarios/list', { title: 'Usuarios', usuarios: rows, message, errors: errors.array(), query: req.query });
};

// Mostrar formulario para crear o editar
exports.form = async (req, res) => {
  const [roles] = await pool.query('SELECT * FROM roles');
  let usuario = null;
  if (req.params.id) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
    if (rows.length) usuario = rows[0];
  }
  const message = req.session.message;
  delete req.session.message;
  const title = req.params.id ? 'Editar usuario' : 'Nuevo usuario';
  res.render('pages/usuarios/form', { title, usuario, roles, errors: [], message });
};

// Crear usuario nuevo
exports.create = async (req, res) => {
  const errors = validationResult(req);
  const [roles] = await pool.query('SELECT * FROM roles');
  if (!errors.isEmpty()) {
    return res.render('pages/usuarios/form', { title: 'Nuevo usuario', usuario: null, roles, errors: errors.array(), message: null });
  }
  const { nombre, apellidos, email, telefono, rol_id, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO usuarios (nombre, apellidos, email, telefono, password, rol_id) VALUES (?,?,?,?,?,?)',
    [nombre, apellidos, email, telefono, hash, rol_id]);
  req.session.message = { type: 'success', text: 'Usuario creado' };
  res.redirect('/usuarios');
};

// Actualizar usuario existente (sin contraseña)
exports.update = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const [roles] = await pool.query('SELECT * FROM roles');
  if (!errors.isEmpty()) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [id]);
    return res.render('pages/usuarios/form', { title: 'Editar usuario', usuario: rows[0], roles, errors: errors.array(), message: null });
  }
  const { nombre, apellidos, email, telefono, rol_id } = req.body;
  await pool.query('UPDATE usuarios SET nombre=?, apellidos=?, email=?, telefono=?, rol_id=? WHERE id=?',
    [nombre, apellidos, email, telefono, rol_id, id]);
  req.session.message = { type: 'success', text: 'Usuario actualizado' };
  res.redirect('/usuarios');
};

// Eliminar usuario
exports.remove = async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id=?', [req.params.id]);
  req.session.message = { type: 'success', text: 'Usuario eliminado' };
  res.redirect('/usuarios');
};

// Formulario para cambiar contraseña
exports.showChangePassword = async (req, res) => {
  const [rows] = await pool.query('SELECT id, nombre, apellidos FROM usuarios WHERE id=?', [req.params.id]);
  if (!rows.length) return res.redirect('/usuarios');
  res.render('pages/usuarios/change-password', { title: 'Cambiar contraseña', usuario: rows[0], errors: [], message: null });
};

// Actualizar contraseña
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const [rows] = await pool.query('SELECT id, nombre, apellidos FROM usuarios WHERE id=?', [id]);
  if (!rows.length) return res.redirect('/usuarios');
  if (!errors.isEmpty()) {
    return res.render('pages/usuarios/change-password', { title: 'Cambiar contraseña', usuario: rows[0], errors: errors.array(), message: null });
  }
  const hash = await bcrypt.hash(req.body.password, 10);
  await pool.query('UPDATE usuarios SET password=? WHERE id=?', [hash, id]);
  req.session.message = { type: 'success', text: 'Contraseña actualizada' };
  res.redirect('/usuarios');
};
