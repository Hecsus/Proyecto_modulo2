/**
 * Archivo principal del servidor Express
 * Cada línea está comentada para facilitar el aprendizaje.
 */

require('dotenv').config();               // 1. Carga las variables de entorno definidas en .env
const path = require('path');             // 2. Módulo nativo para manejar rutas de archivos
const express = require('express');       // 3. Importa Express
const ejsLayouts = require('express-ejs-layouts'); // 4. Soporte para layouts en EJS
const session = require('express-session'); // 5. Manejo de sesiones en memoria

const requireAuth = require('./middlewares/requireAuth'); // 6. Middleware que protege rutas
const requireRole = require('./middlewares/requireRole'); // 7. Middleware para roles específicos

const authRoutes = require('./routes/auth.routes');               // 8. Rutas de autenticación
const productosRoutes = require('./routes/productos.routes');     // 9. Rutas de productos
const categoriasRoutes = require('./routes/categorias.routes');   // 10. Rutas de categorías
const proveedoresRoutes = require('./routes/proveedores.routes'); // 11. Rutas de proveedores
const localizacionesRoutes = require('./routes/localizaciones.routes'); // 12. Rutas de localizaciones

const app = express();                           // 13. Crea la aplicación Express
const PORT = process.env.PORT || 3000;           // 14. Puerto donde se levantará el servidor

app.set('view engine', 'ejs');                   // 15. Define EJS como motor de plantillas
app.set('views', path.join(__dirname, 'views')); // 16. Carpeta donde viven las vistas
app.use(ejsLayouts);                             // 17. Activa el uso de layouts
app.set('layout', 'layouts/layout');             // 18. Layout por defecto

app.use(express.urlencoded({ extended: false })); // 19. Middleware para procesar cuerpos de formularios

app.use(express.static(path.join(__dirname, 'public'))); // 20. Archivos estáticos (css, js, imágenes)

app.use(session({                               // 21. Configuración de la sesión
  secret: process.env.SESSION_SECRET || 'secret', // 22. Clave para firmar la cookie
  resave: false,                                  // 23. No guardar la sesión si no hay cambios
  saveUninitialized: false,                       // 24. No guardar sesiones vacías
  cookie: { httpOnly: true, sameSite: 'lax' }     // 25. Configura la cookie de sesión
}));

app.use((req, res, next) => {                     // 26. Middleware propio para variables globales
  res.locals.isAuthenticated = !!req.session.user; // 27. ¿Hay usuario logueado?
  res.locals.userName = req.session.user ? req.session.user.nombre : null; // 28. Nombre del usuario
  res.locals.userRole = req.session.user ? req.session.user.rol : null;    // 29. Rol del usuario
  next();                                         // 30. Continúa con la siguiente función
});

app.get('/', requireAuth, (req, res) => {         // 31. Ruta principal protegida
  res.render('pages/index');                      // 32. Renderiza la vista de inicio
});

app.use('/', authRoutes);                         // 33. Rutas de autenticación (login/logout)
app.use('/productos', requireAuth, productosRoutes);       // 34. CRUD de productos
app.use('/categorias', requireAuth, categoriasRoutes);    // 35. CRUD de categorías
app.use('/proveedores', requireAuth, proveedoresRoutes);  // 36. CRUD de proveedores
app.use('/localizaciones', requireAuth, localizacionesRoutes); // 37. CRUD de localizaciones

app.listen(PORT, () => {                          // 38. Levanta el servidor
  console.log(`Servidor escuchando en http://localhost:${PORT}`); // 39. Mensaje en consola
});

