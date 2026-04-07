const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario     SERIAL PRIMARY KEY,
        nombre         VARCHAR(100) NOT NULL,
        correo         VARCHAR(150) UNIQUE NOT NULL,
        password       VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ingresos (
        id_ingreso  SERIAL PRIMARY KEY,
        id_usuario  INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        monto       DECIMAL(10,2) NOT NULL,
        descripcion VARCHAR(255),
        categoria   VARCHAR(100) DEFAULT 'General',
        fecha       DATE NOT NULL DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS gastos (
        id_gasto    SERIAL PRIMARY KEY,
        id_usuario  INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        monto       DECIMAL(10,2) NOT NULL,
        descripcion VARCHAR(255),
        categoria   VARCHAR(100) NOT NULL,
        fecha       DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);
    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error inicializando DB:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, initDB };