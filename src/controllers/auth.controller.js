const pool = require('../config/db'); // Conexión a la BD
const bcrypt = require('bcryptjs');   // Para comparar hashes
const { validationResult } = require('express-validator'); // Manejo de validaciones

// Mostrar formulario de login
exports.showLogin = (req, res) => {
  res.render('pages/login', { errors: [] });
};

// Procesar login
exports.login = async (req, res) => {
  const errors = validationResult(req); // Captura errores de validación
  if (!errors.isEmpty()) {
    return res.render('pages/login', { errors: errors.array() });
  }
  const { email, password } = req.body;
  const [rows] = await pool.query(`SELECT u.*, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE email = ?`, [email]);
  if (!rows.length) {
    return res.render('pages/login', { errors: [{ msg: 'Credenciales inválidas' }] });
  }
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password); // Compara hash
  if (!match) {
    return res.render('pages/login', { errors: [{ msg: 'Credenciales inválidas' }] });
  }
  req.session.user = { id: user.id, nombre: user.nombre, rol: user.rol_nombre }; // Guarda datos mín. en sesión
  res.redirect('/');
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
