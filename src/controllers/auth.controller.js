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
  res.render('pages/login', { title: 'Login', errors: [] });
};

/**
 * Procesa las credenciales de login y crea la sesión.
 * Entradas: `email` y `password` desde el cuerpo del formulario.
 * Salidas: redirección a `/panel` o render de `login` con mensajes de error.
 * Validaciones: usa `validationResult` para recoger errores de `loginValidator`.
 * Manejo de errores: credenciales inválidas devuelven mensaje, errores de DB se propagan.
 */
exports.login = async (req, res) => {
  const errors = validationResult(req); // Captura errores de validación
  if (!errors.isEmpty()) {              // Si hay errores en los campos
    req.session.flash = { type: 'error', message: 'Datos inválidos' }; // Prepara mensaje de error
    return res.redirect('/login');      // Redirige para mostrar el mensaje con SweetAlert
  }
  const { email, password } = req.body; // Extrae credenciales
  try {
    const [rows] = await pool.query(    // Busca usuario por email
      `SELECT u.*, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE email = ?`,
      [email]
    );
    if (!rows.length) {                // Si el email no existe
      req.session.flash = { type: 'error', message: 'Credenciales inválidas' }; // Mensaje de error
      return res.redirect('/login');   // Redirige a login
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password); // Compara hash
    if (!match) {                      // Contraseña incorrecta
      req.session.flash = { type: 'error', message: 'Credenciales inválidas' }; // Mensaje de error
      return res.redirect('/login');   // Redirige a login
    }
    req.session.user = { id: user.id, nombre: user.nombre, rol: user.rol_nombre }; // Guarda datos mínimos en sesión
    req.session.flash = { type: 'success', message: 'Bienvenido' }; // Mensaje de éxito
    res.redirect('/panel');            // Redirige al panel
  } catch (err) {
    req.session.flash = { type: 'error', message: 'Error inesperado' }; // Mensaje de excepción
    res.redirect('/login');            // Redirige a login
  }
};

/**
 * Cierra la sesión del usuario.
 * Entradas: req/res con sesión activa.
 * Salidas: redirección a `/login`.
 * Validaciones: ninguna.
 * Manejo de errores: ignora errores al destruir la sesión.
 */
exports.logout = (req, res) => {
  req.session.destroy(() => {          // Al destruir la sesión
    res.redirect('/login');            // Redirige al formulario de login
  });
};
