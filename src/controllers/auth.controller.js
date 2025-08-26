const pool = require('../config/db'); // Conexión a la BD
const bcrypt = require('bcryptjs');   // Para comparar hashes
const { validationResult } = require('express-validator'); // Manejo de validaciones

/**
 * Muestra el formulario de login.
 * Propósito: enviar la vista con el formulario vacío.
 * Entradas: req/res de Express.
 * Salidas: render de `pages/login` con array de errores vacío.
 * Validaciones: ninguna.
 * Manejo de errores: si la vista no existe, Express arrojará un 500.
 */
exports.showLogin = (req, res) => {
  res.render('pages/login', { errors: [] });
};

/**
 * Procesa las credenciales de login y crea la sesión.
 * Entradas: `email` y `password` desde el cuerpo del formulario.
 * Salidas: redirección a `/` o render de `login` con mensajes de error.
 * Validaciones: usa `validationResult` para recoger errores de `loginValidator`.
 * Manejo de errores: credenciales inválidas devuelven mensaje, errores de DB se propagan.
 */
exports.login = async (req, res) => {
  const errors = validationResult(req); // Captura errores de validación
  if (!errors.isEmpty()) {
    return res.render('pages/login', { errors: errors.array() });
  }
  const { email, password } = req.body;
  const [rows] = await pool.query(
    `SELECT u.*, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE email = ?`,
    [email]
  );
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

/**
 * Cierra la sesión del usuario.
 * Entradas: req/res con sesión activa.
 * Salidas: redirección a `/login`.
 * Validaciones: ninguna.
 * Manejo de errores: ignora errores al destruir la sesión.
 */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
