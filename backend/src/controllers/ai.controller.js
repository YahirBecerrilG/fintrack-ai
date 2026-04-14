const { pool }    = require('../config/db');
const aiService   = require('../services/ai.service');

// ── GET datos financieros del usuario ──────────────────
async function getDatosFinancieros(userId) {
  const [resumenRes, categoriasRes, deudasRes] = await Promise.all([
    pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo='ingreso' THEN monto ELSE 0 END), 0) AS total_ingresos,
        COALESCE(SUM(CASE WHEN tipo='gasto'   THEN monto ELSE 0 END), 0) AS total_gastos
      FROM (
        SELECT 'ingreso' AS tipo, monto FROM ingresos
        WHERE id_usuario=$1 AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
        UNION ALL
        SELECT 'gasto' AS tipo, monto FROM gastos
        WHERE id_usuario=$1 AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
      ) t
    `, [userId]),

    pool.query(`
      SELECT categoria, SUM(monto) AS total
      FROM gastos
      WHERE id_usuario=$1
        AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY categoria ORDER BY total DESC
    `, [userId]),

    pool.query(`
      SELECT nombre, saldo_actual, interes, fecha_fin
      FROM deudas
      WHERE id_usuario=$1 AND estado='activa'
    `, [userId]),
  ]);

  const totalIngresos = parseFloat(resumenRes.rows[0].total_ingresos);
  const totalGastos   = parseFloat(resumenRes.rows[0].total_gastos);

  return {
    resumen: {
      total_ingresos: totalIngresos,
      total_gastos:   totalGastos,
      balance:        totalIngresos - totalGastos,
      tasa_ahorro:    totalIngresos > 0
        ? (((totalIngresos - totalGastos) / totalIngresos) * 100).toFixed(1)
        : 0,
      num_deudas:     deudasRes.rows.length,
    },
    gastosPorCategoria: categoriasRes.rows,
    deudas:             deudasRes.rows,
  };
}

// ── POST /api/ai/analyze ────────────────────────────────
async function analyze(req, res) {
  try {
    const datos      = await getDatosFinancieros(req.user.id);
    const respuesta  = await aiService.analizarFinanzas(datos);

    // Guardar recomendación en BD
    await pool.query(
      `INSERT INTO recomendaciones_ia (id_usuario, mensaje)
       VALUES ($1, $2)`,
      [req.user.id, respuesta]
    );

    res.json({ respuesta, contexto: datos.resumen });
  } catch (err) {
    console.error('AI Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al conectar con la IA' });
  }
}

// ── POST /api/ai/chat ───────────────────────────────────
async function chat(req, res) {
  const { mensajes } = req.body;

  if (!mensajes || !Array.isArray(mensajes) || mensajes.length === 0) {
    return res.status(400).json({ error: 'Se requiere el historial de mensajes' });
  }

  try {
    const datos     = await getDatosFinancieros(req.user.id);
    const respuesta = await aiService.chatFinanciero(mensajes, datos.resumen);

    res.json({ respuesta });
  } catch (err) {
    console.error('AI Chat Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al conectar con la IA' });
  }
}

// ── POST /api/ai/optimize-debt ──────────────────────────
async function optimizeDebt(req, res) {
  const { id_deuda } = req.body;

  if (!id_deuda) {
    return res.status(400).json({ error: 'Se requiere id_deuda' });
  }

  try {
    const deudaRes = await pool.query(
      'SELECT * FROM deudas WHERE id_deuda=$1 AND id_usuario=$2',
      [id_deuda, req.user.id]
    );
    if (deudaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    const datos     = await getDatosFinancieros(req.user.id);
    const respuesta = await aiService.optimizarDeuda({
      deuda:   deudaRes.rows[0],
      resumen: datos.resumen,
    });

    res.json({ respuesta });
  } catch (err) {
    console.error('AI Optimize Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al conectar con la IA' });
  }
}

// ── GET /api/ai/history ─────────────────────────────────
async function getHistory(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM recomendaciones_ia
       WHERE id_usuario=$1
       ORDER BY fecha DESC
       LIMIT 10`,
      [req.user.id]
    );
    res.json({ historial: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

module.exports = { analyze, chat, optimizeDebt, getHistory };