# Inventario Módulo 2

Aplicación de gestión de inventario para prácticas del módulo 2. Incluye autenticación, control de roles y CRUD de productos, categorías, proveedores y localizaciones, además de una vista de "bajo stock".

## Stack
- Node.js + Express
- EJS + express-ejs-layouts
- MySQL (mysql2/promise)
- dotenv, express-session, bcryptjs, express-validator, nodemon
- Bootstrap 5 + Boxicons (CDN)

## Estructura de carpetas
```
.
├── db/
│   └── schema.sql
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── public/               # servido como /resources
│   ├── routes/
│   ├── validators/
│   └── views/
│       ├── layouts/
│       ├── partials/
│       └── pages/
├── .env.example
├── package.json
└── README.md
```

## Convenciones
- Rutas: kebab-case (p. ej., `/bajo-stock`).
- Controladores: camelCase.
- Vistas: EJS bajo `src/views/{layouts,partials,pages}`.
- Estáticos: `src/public` se sirve como `/resources`.

## Instalación y ejecución
1. Clona el repositorio.
2. Copia `.env.example` a `.env` y completa los valores.
3. Importa la base de datos:

   ```
   mysql -u root -p < db/schema.sql
   ```

4. Instala dependencias:

   ```
   npm install
   ```

5. Arranca en desarrollo:

   ```
   npm run dev
   ```

6. Arranca en producción:

   ```
   npm start
   ```

## Rutas rápidas de verificación
- `GET /` → página principal (requiere sesión)
- `GET /login` → formulario de acceso
- `GET /health` → `{ status: "ok" }`
- `GET /db-health` → prueba `SELECT 1+1` y JSON con el resultado

## Variables de entorno
```
PORT=3000
SESSION_SECRET=changeme
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventario
```
En XAMPP/MAMP el usuario `root` suele ir sin contraseña → deja `DB_PASSWORD` vacío. En producción usa un usuario propio con permisos limitados y cambia `SESSION_SECRET`.

## Funcionalidades
- Login/logout con sesiones y contraseñas hash (bcryptjs).
- Roles de usuario (admin/operador) y autorización por middleware.
- CRUD: productos, categorías, proveedores y localizaciones.
- Vista bajo stock (productos con stock < stock_minimo).
- Validación de formularios con express-validator y feedback visual (Bootstrap).

## Datos de ejemplo
Incluye un script con usuarios, categorías, proveedores, localizaciones y más de veinte productos.
Importar:

```
mysql -u root -p inventario < db/seeds/20250901_semillas_realistas.sql
```

Contraseñas:
- `admin123` para administradores.
- `usuario123` para operadores.

## Gestión de usuarios (solo admin)
- El menú **Usuarios** sólo aparece para rol administrador.
- Permite listar, crear, editar, eliminar y cambiar contraseñas.
- Validaciones: email válido, rol existente y contraseña mínima de 8 caracteres.

## Stock vs Stock mínimo – guía de uso
- Listados muestran columnas separadas de stock y stock mínimo.
- Si el stock es menor que el mínimo se marca la fila con `table-warning` y badge "Bajo stock".
- Formularios de productos incluyen ayuda para cada campo de stock.

## Política de comentarios ("supercomentado")
- `src/app.js` y `src/config/db.js`: comentados línea a línea explicando qué hace cada instrucción y por qué.
- Resto de archivos (`routes/`, `controllers/`, `validators/`, `views/`): comentarios por bloques cubriendo propósito, entradas/salidas, validaciones y manejo de errores.
- Mantén los comentarios actualizados si refactorizas.

## Normas de iteración
- En cada commit, incluye archivos completos modificados.
- Ejecuta los tests y revisa los logs antes de hacer commit.
- No agregues dependencias innecesarias.

## Criterios de aceptación mínimos
- `npm run dev` arranca sin errores.
- `GET /` y `GET /login` responden 200.
- Estáticos bajo `/resources` responden 200.
- `GET /health` → `{ status: "ok" }`.
- `GET /db-health` devuelve OK y no rompe el servidor.
- CRUD principal (al menos uno) crea/edita/borra y persiste.

## Checklist de regresión
- `npm run dev` sin errores.
- `GET /` renderiza con layout y partials.
- `GET /login` responde 200 y muestra formulario.
- `GET /health` → `{ status: "ok" }`.
- Estáticos en `/resources` cargan sin 404.
- `GET /db-health` OK.
- CRUD principal funciona.

## Troubleshooting
### “Access denied for user ''@'localhost' (using password: NO)”
- Asegúrate de que `.env` está en la raíz del proyecto (junto a `package.json`).
- Revisa que `src/config/db.js` ejecuta `require('dotenv').config()` antes de leer `process.env`.
- Comprueba `DB_USER`, `DB_PASSWORD` y `DB_NAME`.

Usuario propio recomendado:
```
CREATE USER 'inventario'@'localhost' IDENTIFIED BY 'inventario123';
GRANT ALL PRIVILEGES ON inventario.* TO 'inventario'@'localhost';
FLUSH PRIVILEGES;
```

### “Cannot find module 'ejs' / 'express-ejs-layouts'”
Ejecuta `npm install ejs express-ejs-layouts`.

En `app.js`:
```js
app.set('view engine', 'ejs');
app.use(expressLayouts);
```

### “Vistas no se encuentran”
Verifica `app.set('views', path.join(__dirname,'views'))`.
Rutas de render: `res.render('pages/login')` (sin `.ejs`).

### ESM vs CommonJS
Este proyecto usa CommonJS (`require`, `module.exports`). Si cambias a ESM, calcula `__dirname` con `fileURLToPath`.

### Puerto ocupado
Cambia `PORT` en `.env` o libera el puerto.

### Seguridad básica
Nunca subas `.env` al repo.
Cambia `SESSION_SECRET` en producción y activa `cookie.secure` detrás de HTTPS.
Revisa inputs de formularios con express-validator (servidor) además de validación en cliente.

### Errores al importar seeds
- Confirma que la base `inventario` existe y el esquema está aplicado.
- Ejecuta la migración `db/migrations/20250901_1200_add_campos_usuarios.sql` antes de importar si hay columnas faltantes.
- El script de semillas trunca tablas, por lo que cualquier dato previo se pierde.

## Pruebas manuales
1. Importar seeds: `mysql -u root -p inventario < db/seeds/20250901_semillas_realistas.sql`.
2. Login admin: `laura.gonzalez@tienda.local` / `admin123`.
3. Usuarios: crear un operador, editarlo y eliminarlo.
4. Productos: crear uno con stock/stock mínimo y observar badge "Bajo stock" en el listado.
5. Bajo stock: visitar `/productos/bajo-stock` y comprobar resultados.
6. Regresión básica: `/`, `/login`, `/health`, `/resources` y `/db-health` responden 200.

## Resumen de cambios
- Semillas realistas con múltiples entidades y contraseñas bcrypt.
- CRUD de usuarios protegido exclusivamente para administradores.
- Interfaz de productos con columnas separadas de stock y stock mínimo.

## Changelog
### 2025-08-26
- Validación de variables de entorno y carga temprana de `dotenv`.
- Log "DB OK" al iniciar la conexión y mensajes de error claros.
- Ruta `/db-health` para comprobar la base de datos.
- README completado y `.env.example` actualizado.

### 2025-09-01
- Script `20250901_semillas_realistas.sql` con datos de ejemplo realistas.
- Rutas y vistas para gestionar usuarios solo por administradores.
- Listados de productos con columnas de stock y stock mínimo y badges de bajo stock.

