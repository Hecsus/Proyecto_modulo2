# Inventario Módulo 2

Aplicación de gestión de inventario para prácticas del módulo 2.

## Stack
- Node.js
- Express
- EJS + express-ejs-layouts
- MySQL (mysql2/promise)
- dotenv
- express-session
- express-validator

## Árbol de carpetas
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
│   ├── public/
│   ├── routes/
│   ├── validators/
│   └── views/
└── package.json
```

## Setup
1. Clona el repositorio.
2. Copia `.env.example` como `.env` y completa los valores.
3. Importa la base de datos con `mysql -u root < db/schema.sql`.
4. Instala dependencias: `npm install`.
5. Levanta el servidor de desarrollo: `npm run dev`.

## Variables de entorno
```
PORT=3000
SESSION_SECRET=changeme
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventario
```
En instalaciones XAMPP/MAMP el usuario `root` suele venir sin contraseña; deja `DB_PASSWORD` vacío en ese caso.

## Troubleshooting
### "Access denied for user ''@'localhost' (using password: NO)"
- Revisa que el archivo `.env` esté en la raíz del proyecto.
- Asegúrate de que `src/config/db.js` carga `dotenv` antes de leer `process.env`.
- Comprueba `DB_USER` y `DB_PASSWORD` en `.env`.
- Para crear un usuario propio en MySQL:
  ```sql
  CREATE USER 'inventario'@'localhost' IDENTIFIED BY 'tu_password';
  GRANT ALL PRIVILEGES ON inventario.* TO 'inventario'@'localhost';
  FLUSH PRIVILEGES;
  ```

## Normas de iteración
- Mantén el estilo de código y los comentarios existentes.
- Ejecuta los tests y revisa los logs antes de hacer commit.
- No agregues dependencias innecesarias.

## Checklist de regresión
- `npm run dev` arranca sin errores.
- Ruta `GET /db-health` responde `{ ok: true }` cuando la DB está disponible.
- CRUD de productos, categorías, proveedores y localizaciones funciona.

## Changelog
### 2025-08-26
- Validación de variables de entorno y carga temprana de `dotenv`.
- Log "DB OK" al iniciar la conexión y mensajes de error claros.
- Ruta `/db-health` para comprobar la base de datos.
- README completo y `.env.example` actualizado.
