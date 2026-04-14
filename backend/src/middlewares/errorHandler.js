function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  // Error de validación de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia inválida en los datos' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
}

module.exports = errorHandler;