const { pool } = require('../config/db');

// GET /api/ingresos
async function getAll(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM ingresos
       WHERE id_usuario = $1
       ORDER BY fecha DESC, id_ingreso DESC`,
      [req.user.id]
    );
    res.json({ ingresos: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
}

// POST /api/ingresos
async function create(req, res) {
  const { monto, descripcion, categoria, fecha } = req.body;

  if (!monto || monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ingresos (id_usuario, monto, descripcion, categoria, fecha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, monto, descripcion, categoria || 'General', fecha || new Date()]
    );
    res.status(201).json({ ingreso: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ingreso' });
  }
}

// PUT /api/ingresos/:id
async function update(req, res) {
  const { id } = req.params;
  const { monto, descripcion, categoria, fecha } = req.body;

  try {
    // Verificar que el ingreso pertenece al usuario
    const check = await pool.query(
      'SELECT id_ingreso FROM ingresos WHERE id_ingreso = $1 AND id_usuario = $2',
      [id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    const result = await pool.query(
      `UPDATE ingresos
       SET monto=$1, descripcion=$2, categoria=$3, fecha=$4
       WHERE id_ingreso=$5 AND id_usuario=$6
       RETURNING *`,
      [monto, descripcion, categoria, fecha, id, req.user.id]
    );
    res.json({ ingreso: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ingreso' });
  }
}

// DELETE /api/ingresos/:id
async function remove(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM ingresos WHERE id_ingreso=$1 AND id_usuario=$2 RETURNING id_ingreso',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json({ message: 'Ingreso eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  }
}

module.exports = { getAll, create, update, remove };