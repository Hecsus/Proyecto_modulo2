/**
 * Archivo principal del servidor Express.
 * Cada línea describe qué hace y por qué se incluye.
 */

require('dotenv').config();               // Carga variables de entorno para configurar la app sin hardcodear datos sensibles
const path = require('path');             // Módulo nativo para resolver rutas en distintos SO
const express = require('express');       // Framework que simplifica la creación del servidor HTTP
const ejsLayouts = require('express-ejs-layouts'); // Permite reutilizar layouts en las vistas EJS
const session = require('express-session'); // Middleware de sesiones; desde v1.18.0 genera IDs con 'uid-safe' (no usa el paquete vulnerable 'uid2')

const requireAuth = require('./middlewares/requireAuth'); // Middleware que exige autenticación para ciertas rutas
const requireRole = require('./middlewares/requireRole'); // Middleware que limita acceso según rol del usuario

const authRoutes = require('./routes/auth.routes');               // Conjunto de rutas de autenticación
const panelRoutes = require('./routes/panel.routes');             // Conjunto de rutas del panel de inventario
const productosRoutes = require('./routes/productos.routes');     // Conjunto de rutas CRUD de productos
const bajoStockRoutes = require('./routes/bajo-stock.routes');    // Conjunto de rutas de productos con bajo stock
const categoriasRoutes = require('./routes/categorias.routes');   // Conjunto de rutas CRUD de categorías
const proveedoresRoutes = require('./routes/proveedores.routes'); // Conjunto de rutas CRUD de proveedores
const localizacionesRoutes = require('./routes/localizaciones.routes'); // Conjunto de rutas CRUD de localizaciones
const usuariosRoutes = require('./routes/usuarios.routes');     // Conjunto de rutas CRUD de usuarios
const db = require('./config/db');                                // Pool de conexiones MySQL reutilizable

const app = express();                           // Crea la instancia de Express
const PORT = process.env.PORT || 3000;           // Define el puerto; usa env o 3000 por defecto

app.set('view engine', 'ejs');                   // Configura EJS como motor de plantillas
app.set('views', path.join(__dirname, 'views')); // Establece la carpeta de vistas
app.use(ejsLayouts);                             // Habilita el uso de layouts
app.set('layout', 'layouts/layout');             // Layout por defecto a utilizar

app.use(express.urlencoded({ extended: false })); // Parseo de formularios (application/x-www-form-urlencoded)

app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos como /resources

app.use(session({                               // Inicializa la sesión; internamente usa 'uid-safe' para generar IDs aleatorios
  secret: process.env.SESSION_SECRET || 'secret', // Clave secreta para firmar la cookie de sesión
  resave: false,                                  // No regraba la sesión si no hay cambios
  saveUninitialized: false,                       // Evita almacenar sesiones sin datos
  cookie: { httpOnly: true, sameSite: 'lax' }     // Cookie accesible solo por HTTP y con política SameSite laxa
}));

app.use((req, res, next) => {                   // Middleware que gestiona mensajes flash
  res.locals.flash = req.session.flash || null; // Copia el mensaje flash de la sesión a las variables de la vista
  delete req.session.flash;                     // Elimina el mensaje para que solo aparezca una vez
  next();                                       // Continúa con el siguiente middleware en la cadena
});

app.use((req, res, next) => {                     // Middleware que expone datos de sesión y ruta actual
  res.locals.currentPath = req.path;              // Ruta actual para resaltar enlaces activos
  res.locals.isAuthenticated = !!req.session.user; // Booleano con estado de autenticación
  res.locals.userName = req.session.user ? req.session.user.nombre : null; // Nombre del usuario
  res.locals.userRole = req.session.user ? req.session.user.rol : null;    // Rol del usuario logueado
  res.locals.request = req;                      // Objeto de la petición disponible en las vistas
  next();                                         // Continúa con el siguiente middleware
});

app.get('/', requireAuth, (req, res) => {         // Página principal protegida por login
  res.redirect('/panel');                        // Redirige al panel de inventario
});

app.get('/health', (req, res) => {                // Endpoint simple para monitorear el servidor
  res.json({ status: 'ok' });                     // Devuelve JSON indicando que está vivo
});

app.get('/db-health', async (req, res) => {       // Verifica conexión con la base de datos
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result'); // Consulta trivial para testear
    res.json({ ok: true, result: rows[0].result });          // Respuesta si la DB responde
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message }); // Respuesta de error si la consulta falla
  }
});

app.use('/', authRoutes);                         // Monta rutas de login/logout
app.use('/panel', requireAuth, panelRoutes);      // Panel de inventario con métricas
app.use('/productos', requireAuth, productosRoutes);       // CRUD de productos (protección por login)
app.use('/inventario/bajo-stock', requireAuth, bajoStockRoutes); // Listado de productos con bajo stock
app.use('/categorias', requireAuth, categoriasRoutes);    // CRUD de categorías (protección por login)
app.use('/proveedores', requireAuth, proveedoresRoutes);  // CRUD de proveedores (protección por login)
app.use('/localizaciones', requireAuth, localizacionesRoutes); // CRUD de localizaciones (protección por login)
app.use('/usuarios', requireAuth, requireRole('admin'), usuariosRoutes); // CRUD de usuarios (solo admin)

app.listen(PORT, () => {                          // Arranca el servidor
  console.log(`Servidor escuchando en http://localhost:${PORT}`); // Mensaje de inicio en consola
});
