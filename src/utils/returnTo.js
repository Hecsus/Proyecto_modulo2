// Utilidad para validar rutas de retorno (returnTo)
// Entrada: cadena proporcionada por el cliente (query o body).
// Salida: ruta interna segura que siempre comienza con '/'.
// Seguridad: previene redirecciones abiertas verificando que la ruta
//            no comience con '//' ni incluya protocolo.
function validateReturnTo(returnTo) {
  // Solo aceptamos cadenas
  if (typeof returnTo !== 'string') return '/productos';
  // Debe iniciar con una sola '/'; evita '//' que podría implicar esquema
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return '/productos';
  return returnTo;
}
module.exports = { validateReturnTo };
