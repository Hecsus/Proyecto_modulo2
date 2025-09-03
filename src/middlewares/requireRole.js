// Middleware para verificar rol específico (ej: 'admin')
module.exports = (role) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.rol === role) {
      return next(); // Usuario con rol requerido
    }
    return res.status(403).send('Acceso denegado'); // No autorizado
  };
};
