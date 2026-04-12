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

      CREATE TABLE IF NOT EXISTS deudas (
        id_deuda     SERIAL PRIMARY KEY,
        id_usuario   INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        nombre       VARCHAR(150) NOT NULL,
        monto_total  DECIMAL(10,2) NOT NULL,
        saldo_actual DECIMAL(10,2) NOT NULL,
        interes      DECIMAL(5,2)  NOT NULL DEFAULT 0,
        fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
        fecha_fin    DATE,
        estado       VARCHAR(20)   NOT NULL DEFAULT 'activa'
      );

      CREATE TABLE IF NOT EXISTS pagos (
        id_pago    SERIAL PRIMARY KEY,
        id_deuda   INTEGER REFERENCES deudas(id_deuda) ON DELETE CASCADE,
        monto      DECIMAL(10,2) NOT NULL,
        fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
        nota       VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS recomendaciones_ia (
        id_recomendacion SERIAL PRIMARY KEY,
        id_usuario       INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        mensaje          TEXT NOT NULL,
        fecha            TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error inicializando DB:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, initDB };