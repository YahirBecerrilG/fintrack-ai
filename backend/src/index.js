require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { initDB }      = require('./config/db');
const authRoutes      = require('./routes/auth.routes');
const ingresosRoutes  = require('./routes/ingresos.routes');
const gastosRoutes    = require('./routes/gastos.routes');
const resumenRoutes   = require('./routes/resumen.routes');
const deudasRoutes    = require('./routes/deudas.routes');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/gastos',   gastosRoutes);
app.use('/api/resumen',  resumenRoutes);
app.use('/api/deudas',   deudasRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'OK', message: 'FinTrack API running' })
);

initDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 FinTrack backend corriendo en puerto ${PORT}`)
  );
});