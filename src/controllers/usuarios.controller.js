const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult, matchedData } = require('express-validator');

// Listar usuarios con filtros opcionales y paginación
exports.list = async (req, res) => {
  const errors = validationResult(req);
  const data = matchedData(req, { locations: ['query'] });

  const [roles] = await pool.query('SELECT id, nombre FROM roles');

  if (!errors.isEmpty()) {
    const [rows] = await pool.query('SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, r.nombre AS rol FROM usuarios u JOIN roles r ON u.rol_id=r.id ORDER BY u.id ASC');
    return res.render('pages/usuarios/list', {
      title: 'Usuarios',
      usuarios: rows,
      roles,
      errors: errors.array(),
      query: req.query,
      page: 1,
      totalPages: 1,
      message: req.session.message,
      viewClass: 'view-usuarios'
    });
  }

  const page = data.page || 1;
  const pageSize = data.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const SORTABLE = { id: 'u.id', nombre: 'u.nombre', email: 'u.email', telefono: 'u.telefono', rol: 'r.nombre' };
  const sortCol = SORTABLE[data.sortBy] || 'u.id';
  const sortDir = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const clauses = [];
  const params = [];
  if (data.id) { clauses.push('u.id = ?'); params.push(data.id); }
  if (data.nombre) { clauses.push('u.nombre LIKE ?'); params.push(`%${data.nombre}%`); }
  if (data.email) { clauses.push('u.email LIKE ?'); params.push(`%${data.email}%`); }
  if (data.telefono) { clauses.push('u.telefono LIKE ?'); params.push(`%${data.telefono}%`); }
  if (data.rol) {
    const rolId = parseInt(data.rol);
    if (!isNaN(rolId)) {
      clauses.push('u.rol_id = ?');
      params.push(rolId);
    } else {
      const role = roles.find(r => r.nombre === data.rol);
      if (role) { clauses.push('u.rol_id = ?'); params.push(role.id); }
    }
  }
  const whereSql = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';

  const baseSql = `FROM usuarios u JOIN roles r ON u.rol_id = r.id ${whereSql}`;
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, r.nombre AS rol ${baseSql} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${baseSql}`, params);
  const totalPages = Math.ceil(countRows[0].total / pageSize);

  const message = req.session.message;
  delete req.session.message;

  res.render('pages/usuarios/list', {
    title: 'Usuarios',
    usuarios: rows,
    roles,
    errors: [],
    query: req.query,
    page,
    totalPages,
    message,
    viewClass: 'view-usuarios'
  });
};

// Mostrar formulario para crear o editar
exports.form = async (req, res) => {
  const [roles] = await pool.query('SELECT * FROM roles');
  let usuario = null;
  if (req.params.id) { // Precarga datos si hay ID (edición)
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
    if (rows.length) usuario = rows[0];
  }
  const message = req.session.message;
  delete req.session.message;
  const title = req.params.id ? 'Editar usuario' : 'Nuevo usuario';
  res.render('pages/usuarios/form', { title, usuario, roles, errors: [], oldInput: null, message, viewClass: 'view-usuarios' });
};

// Crear usuario nuevo
exports.create = async (req, res) => {
  const errors = validationResult(req);
  const [roles] = await pool.query('SELECT * FROM roles');
  const oldInput = { ...req.body };
  delete oldInput.password; delete oldInput.passwordConfirm; // No repoblar contraseñas
  if (!errors.isEmpty()) {
    return res.render('pages/usuarios/form', { title: 'Nuevo usuario', usuario: null, roles, errors: errors.array(), oldInput, message: null, viewClass: 'view-usuarios' });
  }
  const min = parseInt(req.body.minLength, 10) || 8; // Revalida longitud mínima solicitada
  if (!req.body.password || req.body.password.length < min) {
    return res.render('pages/usuarios/form', { title: 'Nuevo usuario', usuario: null, roles, errors: [{ msg: `Contraseña mínima de ${min} caracteres` }], oldInput, message: null, viewClass: 'view-usuarios' });
  }
  const { nombre, apellidos, email, telefono, rol_id, password } = req.body;
  const hash = await bcrypt.hash(password, 10); // Hash seguro
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
  const oldInput = { ...req.body };
  if (!errors.isEmpty()) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [id]);
    return res.render('pages/usuarios/form', { title: 'Editar usuario', usuario: rows[0], roles, errors: errors.array(), oldInput, message: null, viewClass: 'view-usuarios' });
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
  res.render('pages/usuarios/change-password', { title: 'Cambiar contraseña', usuario: rows[0], errors: [], oldInput: null, message: null, viewClass: 'view-usuarios' });
};

// Actualizar contraseña
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const [rows] = await pool.query('SELECT id, nombre, apellidos FROM usuarios WHERE id=?', [id]);
  if (!rows.length) return res.redirect('/usuarios');
  if (req.body.confirm !== 'yes') { // Confirmación desde SweetAlert2
    errors.errors.push({ msg: 'Confirmación requerida' });
  }
  if (!errors.isEmpty()) {
    return res.render('pages/usuarios/change-password', { title: 'Cambiar contraseña', usuario: rows[0], errors: errors.array(), oldInput: null, message: null, viewClass: 'view-usuarios' });
  }
  const hash = await bcrypt.hash(req.body.password, 10); // Hash de la nueva contraseña
  await pool.query('UPDATE usuarios SET password=? WHERE id=?', [hash, id]);
  req.session.message = { type: 'success', text: 'Contraseña actualizada' };
  res.redirect('/usuarios');
};
// [checklist] permiso admin, validaciones, SQL parametrizado y sin passwords expuestas
