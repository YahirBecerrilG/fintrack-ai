const { pool } = require('../config/db');

// ── Helpers de cálculo ──────────────────────────────────

// Calcula la cuota mensual con interés compuesto
// Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
function calcularCuotaMensual(saldo, tasaAnual, meses) {
  if (tasaAnual === 0) return saldo / meses;
  const r = tasaAnual / 100 / 12;
  return (saldo * r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
}

// Genera tabla de amortización completa
function generarTablaAmortizacion(saldo, tasaAnual, cuotaMensual) {
  const plan = [];
  let saldoRestante = parseFloat(saldo);
  const r = tasaAnual / 100 / 12;
  let mes = 1;

  while (saldoRestante > 0.01 && mes <= 360) {
    const interesMes   = saldoRestante * r;
    const capitalMes   = Math.min(cuotaMensual - interesMes, saldoRestante);
    saldoRestante      = Math.max(0, saldoRestante - capitalMes);

    plan.push({
      mes,
      cuota:     parseFloat(cuotaMensual.toFixed(2)),
      interes:   parseFloat(interesMes.toFixed(2)),
      capital:   parseFloat(capitalMes.toFixed(2)),
      saldo:     parseFloat(saldoRestante.toFixed(2)),
    });
    mes++;
  }
  return plan;
}

// ── CRUD deudas ─────────────────────────────────────────

// GET /api/deudas
async function getAll(req, res) {
  try {
    const result = await pool.query(`
      SELECT d.*,
        COALESCE((
          SELECT SUM(monto) FROM pagos WHERE id_deuda = d.id_deuda
        ), 0) AS total_pagado
      FROM deudas d
      WHERE d.id_usuario = $1
      ORDER BY d.estado ASC, d.fecha_inicio DESC
    `, [req.user.id]);

    res.json({ deudas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener deudas' });
  }
}

// POST /api/deudas
async function create(req, res) {
  const { nombre, monto_total, interes, fecha_inicio, fecha_fin } = req.body;

  if (!nombre || !monto_total || monto_total <= 0) {
    return res.status(400).json({ error: 'Nombre y monto son requeridos' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO deudas
        (id_usuario, nombre, monto_total, saldo_actual, interes, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, nombre, monto_total, interes || 0, fecha_inicio || new Date(), fecha_fin]);

    res.status(201).json({ deuda: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear deuda' });
  }
}

// PUT /api/deudas/:id
async function update(req, res) {
  const { id } = req.params;
  const { nombre, monto_total, saldo_actual, interes, fecha_fin, estado } = req.body;

  try {
    const check = await pool.query(
      'SELECT id_deuda FROM deudas WHERE id_deuda=$1 AND id_usuario=$2',
      [id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    const result = await pool.query(`
      UPDATE deudas
      SET nombre=$1, monto_total=$2, saldo_actual=$3, interes=$4, fecha_fin=$5, estado=$6
      WHERE id_deuda=$7 AND id_usuario=$8
      RETURNING *
    `, [nombre, monto_total, saldo_actual, interes, fecha_fin, estado, id, req.user.id]);

    res.json({ deuda: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar deuda' });
  }
}

// DELETE /api/deudas/:id
async function remove(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM deudas WHERE id_deuda=$1 AND id_usuario=$2 RETURNING id_deuda',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }
    res.json({ message: 'Deuda eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar deuda' });
  }
}

// ── Plan de pagos ────────────────────────────────────────

// GET /api/deudas/:id/plan
async function getPlan(req, res) {
  const { id } = req.params;
  const { meses = 12 } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM deudas WHERE id_deuda=$1 AND id_usuario=$2',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    const deuda        = result.rows[0];
    const saldo        = parseFloat(deuda.saldo_actual);
    const tasaAnual    = parseFloat(deuda.interes);
    const numMeses     = parseInt(meses);
    const cuotaMensual = calcularCuotaMensual(saldo, tasaAnual, numMeses);
    const tabla        = generarTablaAmortizacion(saldo, tasaAnual, cuotaMensual);
    const totalPagar   = tabla.reduce((s, r) => s + r.cuota, 0);
    const totalInteres = tabla.reduce((s, r) => s + r.interes, 0);

    res.json({
      deuda: {
        nombre:       deuda.nombre,
        saldo_actual: saldo,
        interes:      tasaAnual,
      },
      plan: {
        meses_plazo:    numMeses,
        cuota_mensual:  parseFloat(cuotaMensual.toFixed(2)),
        total_a_pagar:  parseFloat(totalPagar.toFixed(2)),
        total_intereses: parseFloat(totalInteres.toFixed(2)),
        meses_reales:   tabla.length,
      },
      tabla_amortizacion: tabla.slice(0, 24), // máximo 24 meses en vista
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar plan de pagos' });
  }
}

// ── Registrar pago ───────────────────────────────────────

// POST /api/deudas/:id/pagos
async function registrarPago(req, res) {
  const { id } = req.params;
  const { monto, nota } = req.body;

  if (!monto || monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    // Verificar deuda
    const deudaRes = await pool.query(
      'SELECT * FROM deudas WHERE id_deuda=$1 AND id_usuario=$2',
      [id, req.user.id]
    );
    if (deudaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    const deuda         = deudaRes.rows[0];
    const nuevoSaldo    = Math.max(0, parseFloat(deuda.saldo_actual) - parseFloat(monto));
    const nuevoEstado   = nuevoSaldo === 0 ? 'pagada' : 'activa';

    // Insertar pago
    await pool.query(
      'INSERT INTO pagos (id_deuda, monto, nota) VALUES ($1, $2, $3)',
      [id, monto, nota]
    );

    // Actualizar saldo de la deuda
    await pool.query(
      'UPDATE deudas SET saldo_actual=$1, estado=$2 WHERE id_deuda=$3',
      [nuevoSaldo, nuevoEstado, id]
    );

    res.status(201).json({
      message: nuevoEstado === 'pagada'
        ? '🎉 ¡Deuda pagada completamente!'
        : 'Pago registrado correctamente',
      saldo_restante: nuevoSaldo,
      estado:         nuevoEstado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
}

// GET /api/deudas/:id/pagos
async function getPagos(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM pagos WHERE id_deuda=$1 ORDER BY fecha_pago DESC',
      [id]
    );
    res.json({ pagos: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
}

module.exports = { getAll, create, update, remove, getPlan, registrarPago, getPagos };