// Middleware para verificar si el usuario está autenticado
module.exports = (req, res, next) => {
  if (req.session.user) { // ¿Existe usuario en sesión?
    return next();        // Sí: continúa
  }
  return res.redirect('/login'); // No: redirige a login
};
// [checklist] permiso correcto y sin código muerto
