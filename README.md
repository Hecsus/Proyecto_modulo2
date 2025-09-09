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
- Rutas: **kebab-case** (`/productos/bajo-stock`)
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
- `/` → redirige al panel (requiere sesión)
- `/login`
- `/health`
- `/productos`
- `/productos/bajo-stock`
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
- Columna "Procedencia" con popover de categorías y proveedores en listados y detalle.
- Formulario de producto con categorías y proveedores en varias columnas y buscador en vivo.
- Tarjetas del panel clicables (stretched-link) hacia sus vistas.
- Búsquedas con filtros y ordenación; operadores `=` por defecto si no se elige otro (popup informativo una vez por campo).
- Badges que comparan **stock** vs **stock mínimo** para resaltar faltantes.

## Seguridad aplicada
- Variables de entorno cargadas con **dotenv** y verificadas al inicio.
- Contraseñas protegidas con **bcryptjs** (hash y `compare`).
- Sesiones con **express-session** configuradas `httpOnly`, `sameSite:'lax'`, `secure` en producción y `maxAge` de 1 h.
- Validación de formularios vía **express-validator**.
- Consultas MySQL siempre parametrizadas (`?`) usando **mysql2/promise**.
- Vistas EJS escapadas con `<%= %>` y enlaces condicionados por rol (`requireRole`).

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
Los formularios de búsqueda permiten elegir operadores '=', '≤' o '≥' para precio, stock y stock mínimo. Si se deja sin operador
 pero con valor, el backend asume '=' por defecto y se muestra un aviso informativo una sola vez por campo.
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
- [ ] `npm start` arranca sin errores.
- [ ] GET `/` redirige a `/panel` cuando hay sesión.
- [ ] GET `/login` responde 200 y valida con bcrypt.
- [ ] GET `/health` responde `{status:"ok"}`.
- [ ] Tarjeta “Bajo stock” en el panel lleva a `/productos/bajo-stock`.
- [ ] CRUDs principales operan correctamente (rutas protegidas por rol).
- [ ] Sin referencias a `nodemon` ni `uid2`.
- [ ] Auditoría de producción sin vulnerabilidades críticas.

## Pruebas manuales sugeridas
- `npm install`
- `npm start`
- Abrir [http://localhost:3000/](http://localhost:3000/) → redirige a `/login` si no hay sesión.
- Abrir [http://localhost:3000/login](http://localhost:3000/login) y probar credenciales válidas/invalidas.
- Abrir [http://localhost:3000/health](http://localhost:3000/health) → `{status:"ok"}`.
- Desde el panel, pulsar tarjeta **Productos** → `/productos`.
- Desde el panel, pulsar tarjeta **Bajo stock** → `/productos/bajo-stock` (lista filtrada).
- En `/productos/bajo-stock` verificar listado con `stock < stock_minimo` y navegación con `returnTo` en detalles.
- Confirmar que solo administradores ven botones de crear/editar/eliminar.
 - Login: forzar error y verificar que el email persiste, la contraseña queda vacía y el toggle funciona.
 - Crear producto con dos categorías y dos proveedores incluyendo observaciones; comprobar en detalle y listado.
 - Editar producto cambiando categorías y proveedores; verificar que la transacción actualiza las asociaciones.
 - Alta de usuario: probar email inválido o duplicado, emailConfirm distinto, contraseñas <8 o desiguales; los campos de contraseña no se repueblan y los toggles funcionan.
 - Cambio de contraseña: confirma el SweetAlert2, valida longitud y coincidencia; tras error los campos quedan vacíos.
## Troubleshooting
- **DB access denied**: revisa credenciales y privilegios MySQL.
- **Módulos EJS/layouts no encontrados**: ejecuta `npm install`.
- **Vistas no encontradas**: confirma rutas en `res.render` y estructura de `views`.
- **CJS/ESM**: el proyecto usa CommonJS; evita `import/export` sin transpilar.
- **Puerto ocupado**: cambia `PORT` en `.env`.
- **Seguridad básica**: usa `SESSION_SECRET` fuerte y HTTPS en producción.
- **Errores al importar seeds**: asegúrate de que la base existe y de tener permisos.

## CHANGELOG
## [2025-09-09 22:15] – Login con toggle reutilizable y validaciones reforzadas
- Login: botón "ver contraseña" restaurado y email persistente al fallar.
- Productos: categorías y proveedores se guardan en crear/editar mediante tablas puente y transacción en update.
- Usuarios: alta con doble validación de email y contraseña mínima de 8, confirmación y toggles.
- Cambio de contraseña: confirmación previa, validaciones y campos en blanco tras error.
## [2025-09-09 18:56] – Permisos de operador, Observaciones en producto, Procedencia persistente, Alta/Password de usuarios con doble validación y toggle
- Operador puede gestionar inventario (productos, categorías, proveedores, localizaciones); solo admin gestiona usuarios/roles.
- Productos: campo Observaciones añadido en alta/edición y visible en detalle/lista.
- Productos: guardado correcto de categorías y proveedores en crear y editar (transacción en update, tablas puente).
- Usuarios: alta con longitud mínima configurable, doble validación email/contraseña y toggles de visibilidad.
- Cambio de contraseña con doble validación, confirmación y toggle.
- Limpieza de código y comentarios añadidos; SQL parametrizado y validaciones reforzadas.
## [2025-09-10 12:00] – Seguridad reforzada y bajo stock integrado
- Tarjeta “Bajo stock” del panel enlaza a `/productos/bajo-stock`.
- Sesiones con cookies seguras y variables de entorno obligatorias.
- Rutas de escritura protegidas con `requireRole('admin')` y enlaces ocultos según rol.
- Documentación y guía de aprendizaje actualizadas.

## [2025-09-09 17:33] – Panel bajo stock navegable + Login persistente/mostrar contraseña + Limpieza “Procedencia” + Comentarios
- Panel: la tarjeta “Bajo stock” ahora enlaza correctamente a /bajo-stock (stretched-link).
- Login: se preserva el email tras error; botón para mostrar/ocultar contraseña (no se repuebla la contraseña por seguridad).
- Detalle de producto: se elimina “Procedencia” (evitamos duplicar categorías y proveedores).
- Revisión y comentarios en todo el código; limpieza de restos no usados.
- Nota: la vista de login reside en `src/views/pages/auth/login.ejs`.

## [2025-09-09 16:21] – Columna “Procedencia”, formulario multicolumna con buscador y limpieza de shapes/colores
- Se elimina la representación por formas/colores (triángulos/círculos/cuadrados) y la leyenda asociada.
- Se añade la columna “Procedencia” (categorías + proveedores) con popover en Productos y Bajo stock.
- En “Nuevo producto/Editar”, categorías y proveedores se muestran en varias columnas y con buscador en vivo.
- Limpieza de CSS/JS/EJS relacionado a shapes/leyenda; comentarios y documentación actualizada.

## [2025-09-09 03:40] – Detalle con símbolos, triángulo en localización, alineado/espaciado, popover de operadores al pasar y leyenda
- Detalle de producto con todos los datos y símbolos junto a cada dato; badge Bajo stock conservado.
- Localizaciones representadas con triángulos coherentes en todas las vistas.
- Alineado/espaciado mejorado para evitar solapes de iconos y descentrados.
- Popover de ayuda en operadores (hover) en paneles de búsqueda.
- Leyenda reutilizable (círculo=Categoría, cuadrado=Proveedor, triángulo=Localización) incluida en vistas necesarias.
- Limpieza de código y comentarios añadidos.
## [2025-09-09 02:30] – Popup operadores + orden invertido + formas y colores vivos + iconos a la derecha + panel clicable
- Se restaura el popup de ayuda en operadores (=, ≤, ≥) para precio/stock/stock mín.; backend sigue usando '=' por defecto si no se elige.
- Se invierte el orden de campos: operador a la izquierda, número a la derecha; placeholders claros ('Precio/Stock/Stock mín.' y 'num').
- Se añaden formas por entidad: círculo (categoría), cuadrado (proveedor), triángulo (localización) con colores más vivos por bucket id%12 y tooltips.
- En productos, las formas se muestran a la derecha del nombre; localización con triángulo coherente.
- Las tarjetas del panel ahora son clicables y llevan a sus vistas.
- Revisión y comentarios añadidos; limpieza de restos si los hubiera.

## [2025-09-09 01:00] – Búsqueda minimalista, colores por fila, círculos por taxonomía y confirmación de borrado
- Simplificado panel de búsqueda (sin títulos/ayudas en operadores; placeholders “Precio/Stock/Stock mín.” y “num”).
- Eliminados fondos por vista (fondo neutro).
- Filas con color único en categorías/proveedores/localizaciones (bucket id%12).
- Formas y colores vivos junto al nombre del producto: círculo=categoría, cuadrado=proveedor; triángulo de localización en su columna con tooltip.
- Confirmación SweetAlert2 en todas las acciones de eliminar.
- Limpieza de código redundante y comentarios añadidos.
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
<!-- [checklist] Requisito implementado | Validación aplicada | SQL parametrizado (si aplica) | Comentarios modo curso | Sin código muerto -->
