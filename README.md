# Inventario Módulo 2

Aplicación de gestión de inventario pensada para prácticas del módulo 2. Incluye login con roles, CRUDs completos y panel con métricas.

## Histórico anterior (resumen)
- Corrección de vistas EJS y layouts.
- Reestructuración inicial del proyecto y semillas SQL.
- Filtros y ordenación con operadores numéricos.
- Checkboxes en nuevo producto.
- SweetAlert2 en login.
- Fixes de operadores y contadores del panel.
- Navbar responsive y títulos dinámicos.

## Stack técnico
- Node.js >=18
- Express 4.19.x
- EJS + express-ejs-layouts
- MySQL (mysql2)
- dotenv
- express-session ^1.18.0
- express-validator
- bcryptjs

## Estructura de carpetas
```
.
├── db/                    # SQL y semillas
├── scripts/               # Utilidades como clean-install.ps1
├── src/
│   ├── app.js             # Arranque del servidor
│   ├── config/            # Configuración (db.js)
│   ├── controllers/       # Lógica de cada recurso
│   ├── middlewares/       # requireAuth, requireRole, etc.
│   ├── routes/            # Definición de rutas Express
│   ├── utils/             # Helpers varios
│   ├── validators/        # Validaciones con express-validator
│   ├── views/
│   │   ├── layouts/       # Layouts EJS
│   │   ├── partials/      # Partes reutilizables
│   │   └── pages/         # Vistas específicas
│   └── public/
│       ├── css/
│       └── js/
└── README.md
```

## Convenciones
- Rutas: **kebab-case** (`/bajo-stock`)
- Controladores: **camelCase**
- Vistas: EJS bajo `layouts/`, `partials/` y `pages/`
- Archivos estáticos servidos desde `/resources` (`src/public`)

## Guía de lectura del código
- **src/app.js**: configuración de Express y rutas principales.
- **src/config/db.js**: pool de conexiones MySQL.
- **src/routes/**: agrupa rutas por recurso.
- **src/controllers/**: lógica de negocio para cada ruta.
- **src/validators/**: validaciones de formularios.
- **src/views/**: layouts, parciales y páginas en EJS.

## Instalación y ejecución
1. Clona el repositorio.
2. Copia `.env.example` a `.env` y completa los valores.
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Arranque en desarrollo:
   ```bash
   npm run dev
   ```
5. Arranque en producción:
   ```bash
   npm start
   ```

## Variables de entorno
```
PORT=3000
SESSION_SECRET=tu_clave
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventario
```
> Si usas XAMPP, el usuario suele ser `root` sin contraseña.

## Rutas rápidas de verificación
- `/panel`
- `/login`
- `/health`
- `/db-health`
- `/resources` para archivos estáticos

## Seguridad y dependencias
- No usar `npm audit fix --force`: podría instalar Express 5.x o dependencias incompatibles.
- Reinstalación limpia (Windows): `scripts/clean-install.ps1`.
- Auditoría solo producción:
  ```bash
  npm audit --omit=dev
  ```
- Despliegue sin devDeps:
  ```bash
  npm ci --omit=dev
  ```
- Overrides aplicados para fijar versiones seguras de dependencias transitivas: `debug`, `braces`, `micromatch`, `extglob`, `nanomatch`, `cross-spawn`, `ansi-styles`, `chalk`, `color-convert`, `color-name`, `got`, `supports-color`, `strip-ansi`, `ansi-regex`, `string-width`, `widest-line`, `update-notifier`, `boxen`.

## Funcionalidades
- Login con roles y gestión de usuarios.
- CRUDs para productos, categorías, proveedores, localizaciones y usuarios.
- Listado de productos con **bajo stock**.
- Validación y feedback con express-validator.
- Panel con contadores de métricas y navegación responsive.
- Navbar responsive con estado de sesión.
- Títulos dinámicos: `<title><%= title ? title + ' — ' : '' %>Inventario</title>`.
- Panel de búsqueda plegable con botones **Buscar** y **Limpiar**.
- `returnTo` en detalles para volver a la lista anterior.
- SweetAlert2 en login y acciones sensibles.
- Columnas de costo/observaciones con tooltip y detalle extendido.
- Usuarios con teléfono y búsquedas en categorías/proveedores/localizaciones/usuarios.
- Icono de proveedores correcto en el panel de inventario.
- Búsquedas con filtros y ordenación; operadores `=` por defecto si no se elige otro.
- Badges que comparan **stock** vs **stock mínimo** para resaltar faltantes.

## Datos de ejemplo
Importa las semillas SQL:
```bash
mysql -u usuario -p inventario < db/seeds.sql
```
Evita `TRUNCATE` en producción; si es necesario limpiar, usa `DELETE`.

## Gestión de usuarios
Solo los usuarios con rol **admin** pueden crear, editar o eliminar otros usuarios. El resto de perfiles es de solo lectura.

## Stock vs Stock mínimo
Los listados muestran badges comparando el stock actual con el mínimo definido: si el stock es menor al mínimo la etiqueta aparece en rojo, de lo contrario en verde.

## Filtros y operadores
Los formularios de búsqueda permiten elegir operadores '=', '≤' o '≥' para precio, stock y stock mínimo. Si se deja sin operador pero con valor, el backend asume '=' por defecto y se muestra un aviso informativo.

## Navegación “Volver”
Las páginas de detalle incluyen `returnTo` para regresar a la vista previa.

## Política de comentarios
- `src/app.js` y `src/config/db.js` están **supercomentados** línea a línea.
- El resto del código usa comentarios por bloques cuando es relevante.

## Normas de iteración
- Entregar archivos completos, sin placeholders.
- Probar manualmente las funcionalidades antes de subir cambios.
- No añadir dependencias innecesarias.

## Criterios de aceptación mínimos y Checklist de regresión
- [ ] `npm run dev` arranca sin errores.
- [ ] Login y panel funcionan.
- [ ] CRUDs principales operan correctamente.
- [ ] Sin referencias a `nodemon` ni `uid2`.
- [ ] Auditoría de producción sin vulnerabilidades críticas.

## Pruebas manuales sugeridas
1. Acceder al panel y verificar contadores e iconos.
2. En Productos, buscar con precio/stock/mín sin operador: aparece popup informativo solo una vez; ejecutar búsqueda usa '='.
3. En Bajo stock, repetir la prueba anterior.
4. En cualquier listado, ordenar por Costo y comprobar el orden.
5. Revisar navbar y subheaders en distintas vistas; títulos dinámicos.
6. Fondos por vista: panel, productos y bajo stock muestran colores suaves distintos.
7. Formularios de búsqueda: etiquetas "Precio", "Stock" y "Stock mín." sin textos de ayuda redundantes; el popup aparece si falta operador.
8. Detalle de producto muestra badge "Bajo stock" si el stock es menor al mínimo.
9. Badges de categoría/proveedor/localización conservan color consistente en listas y detalle.
10. Paginación no abre automáticamente el panel de búsqueda.

Al visitar `/panel`, `/productos`, `/bajo-stock`, `/usuarios`, `/categorias`, `/proveedores` y `/localizaciones` confirmar:
- No hay errores en `layout.ejs`.
- Cada vista aplica su fondo mediante `viewClass`.
- Búsqueda y paginación continúan funcionando sin desplegar filtros automáticamente.
- Persisten popups de operadores y botones Buscar/Limpiar.
- El badge "Bajo stock" se muestra en detalles cuando corresponde.
- No aparecen subtítulos redundantes bajo los títulos.
- La consola del navegador no muestra warnings por imports o variables sin uso.

## Troubleshooting
- **DB access denied**: revisa credenciales y privilegios MySQL.
- **Módulos EJS/layouts no encontrados**: ejecuta `npm install`.
- **Vistas no encontradas**: confirma rutas en `res.render` y estructura de `views`.
- **CJS/ESM**: el proyecto usa CommonJS; evita `import/export` sin transpilar.
- **Puerto ocupado**: cambia `PORT` en `.env`.
- **Seguridad básica**: usa `SESSION_SECRET` fuerte y HTTPS en producción.
- **Errores al importar seeds**: asegúrate de que la base existe y de tener permisos.

## CHANGELOG
## [2025-09-09 00:30] – Fix viewClass + limpieza y guía
- Añadido fallback seguro de viewClass en layout.ejs y paso de viewClass desde controladores.
- Limpieza de imports/fragmentos sin uso y subtítulos redundantes en vistas.
- Añadida guía pedagógica en docs/guia_aprendiz.txt explicando arquitectura, archivos y flujo.
## [2025-09-08 22:26] – UX operadores, fondos por vista, badge detalle, colores taxonomías, limpieza subtítulos
- Limpieza de textos de ayuda y palabra "Operador" en filtros de Productos y Bajo stock; etiquetas unificadas.
- Eliminación de subtítulos redundantes en Panel, Productos y Bajo stock.
- Nuevos fondos por vista mediante variables CSS.
- Badge reutilizable de "Bajo stock" y colores determinísticos por categoría/proveedor/localización.
- README ampliado con pruebas manuales actualizadas.
## [2025-09-08 19:25] – Popup de operadores, ordenar por costo, estilo visual y README restaurado
- Añadido popup (SweetAlert2) y tooltip para operadores en productos y bajo stock; backend mantiene '=' por defecto si no se elige operador.
- “Ordenar por…” ampliado con Costo y campos pendientes; validación/whitelist en controladores/validators.
- Estilo visual renovado con CSS variables, cards de resumen con iconos SVG (sin binarios), navbar y subheaders diferenciados.
- README restaurado y unificado: se recuperan/recapitulán changelogs previos y se documenta esta iteración.

### [2025-09-08 18:35] – Eliminación de nodemon y saneado de vulnerabilidades
- Eliminado nodemon y devDependencies asociadas.
- Estabilizado stack en Express 4.19.x + express-session ^1.18.0.
- Añadidos overrides para dependencias transitivas potencialmente vulnerables.
- README restaurado y ampliado: seguridad, reinstalación limpia, auditoría prod y despliegue sin devDeps.

### [2025-09-08 18:11] – Saneado dependencias y fix 'uid2'
- Fijado Express 4.19.x y express-session ^1.18.0.
- Añadidos "overrides" para transitivas vulnerables (braces, micromatch, cross-spawn, debug, color-convert, color-name, got...).
- README: guía de reinstalación, auditoría prod y despliegue sin devDeps.
