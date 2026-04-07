const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario   SERIAL PRIMARY KEY,
        nombre       VARCHAR(100) NOT NULL,
        correo       VARCHAR(150) UNIQUE NOT NULL,
        password     VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error inicializando DB:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, initDB };