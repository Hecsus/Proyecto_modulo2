/**
 * Archivo: src/config/db.js
 * Configuración de la conexión a MySQL usando mysql2/promise.
 * Cada línea está comentada para que se entienda claramente qué hace.
 */

require('dotenv').config(); // Carga las variables de entorno del archivo .env

const mysql = require('mysql2/promise'); // Importa la librería mysql2 en su versión basada en promesas

// Crea un pool de conexiones para reutilizar conexiones a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // Host donde está la base de datos
  user: process.env.DB_USER,      // Usuario con permisos en la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  database: process.env.DB_DATABASE, // Nombre de la base de datos a usar
  waitForConnections: true,       // Espera si todas las conexiones están ocupadas
  connectionLimit: 10,            // Número máximo de conexiones simultáneas
  queueLimit: 0                   // 0 = ilimitado, las solicitudes se encolan hasta obtener conexión
});

module.exports = pool; // Exporta el pool para usarlo en otros módulos
