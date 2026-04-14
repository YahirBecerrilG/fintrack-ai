require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const { initDB }   = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes     = require('./routes/auth.routes');
const ingresosRoutes = require('./routes/ingresos.routes');
const gastosRoutes   = require('./routes/gastos.routes');
const resumenRoutes  = require('./routes/resumen.routes');
const deudasRoutes   = require('./routes/deudas.routes');
const aiRoutes       = require('./routes/ai.routes');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

// Logging básico
app.use((req, _, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth',     authRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/gastos',   gastosRoutes);
app.use('/api/resumen',  resumenRoutes);
app.use('/api/deudas',   deudasRoutes);
app.use('/api/ai',       aiRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'OK', version: '1.0.0', timestamp: new Date().toISOString() })
);

// 404
app.use((req, res) =>
  res.status(404).json({ error: `Ruta ${req.path} no encontrada` })
);

// Error handler global (siempre al final)
app.use(errorHandler);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FinTrack API v1.0.0 corriendo en puerto ${PORT}`);
    console.log(`📋 Endpoints: auth | ingresos | gastos | resumen | deudas | ai`);
  });
});