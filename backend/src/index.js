require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FinTrack API running' });
});

// Iniciar DB y servidor
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FinTrack backend corriendo en puerto ${PORT}`);
  });
});