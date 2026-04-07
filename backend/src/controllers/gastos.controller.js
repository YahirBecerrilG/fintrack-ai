const { pool } = require('../config/db');

const CATEGORIAS_VALIDAS = [
  'Comida', 'Transporte', 'Salud', 'Entretenimiento',
  'Ropa', 'Educacion', 'Servicios', 'Otros'
];

// GET /api/gastos
async function getAll(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM gastos
       WHERE id_usuario = $1
       ORDER BY fecha DESC, id_gasto DESC`,
      [req.user.id]
    );
    res.json({ gastos: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
}

// POST /api/gastos
async function create(req, res) {
  const { monto, descripcion, categoria, fecha } = req.body;

  if (!monto || monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }
  if (!categoria) {
    return res.status(400).json({ error: 'La categoría es requerida' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO gastos (id_usuario, monto, descripcion, categoria, fecha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, monto, descripcion, categoria, fecha || new Date()]
    );
    res.status(201).json({ gasto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear gasto' });
  }
}

// PUT /api/gastos/:id
async function update(req, res) {
  const { id } = req.params;
  const { monto, descripcion, categoria, fecha } = req.body;

  try {
    const check = await pool.query(
      'SELECT id_gasto FROM gastos WHERE id_gasto=$1 AND id_usuario=$2',
      [id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    const result = await pool.query(
      `UPDATE gastos
       SET monto=$1, descripcion=$2, categoria=$3, fecha=$4
       WHERE id_gasto=$5 AND id_usuario=$6
       RETURNING *`,
      [monto, descripcion, categoria, fecha, id, req.user.id]
    );
    res.json({ gasto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
}

// DELETE /api/gastos/:id
async function remove(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM gastos WHERE id_gasto=$1 AND id_usuario=$2 RETURNING id_gasto',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
}

module.exports = { getAll, create, update, remove };