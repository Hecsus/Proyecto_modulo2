require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const k of required) {
  if (process.env[k] === undefined) {
    throw new Error(`[Config] Falta variable de entorno: ${k}. Crea .env en la raíz y rellénala.`);
  }
}

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('DB OK');
    conn.release();
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  }
})();

module.exports = pool;
