const { pool } = require('../config/db');

async function getResumen(req, res) {
  const id = req.user.id;

  try {
    // Total ingresos del mes actual
    const ingresos = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) AS total
      FROM ingresos
      WHERE id_usuario = $1
        AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `, [id]);

    // Total gastos del mes actual
    const gastos = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) AS total
      FROM gastos
      WHERE id_usuario = $1
        AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `, [id]);

    // Gastos por categoría (mes actual)
    const porCategoria = await pool.query(`
      SELECT categoria, COALESCE(SUM(monto), 0) AS total
      FROM gastos
      WHERE id_usuario = $1
        AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY categoria
      ORDER BY total DESC
    `, [id]);

    // Últimos 6 meses — ingresos vs gastos
    const historial = await pool.query(`
      SELECT
        mes,
        COALESCE(SUM(total_ingresos), 0) AS total_ingresos,
        COALESCE(SUM(total_gastos), 0)   AS total_gastos
      FROM (
        SELECT TO_CHAR(DATE_TRUNC('month', fecha), 'Mon YY') AS mes,
               SUM(monto) AS total_ingresos, 0 AS total_gastos
        FROM ingresos
        WHERE id_usuario = $1
          AND fecha >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', fecha)

        UNION ALL

        SELECT TO_CHAR(DATE_TRUNC('month', fecha), 'Mon YY') AS mes,
               0 AS total_ingresos, SUM(monto) AS total_gastos
        FROM gastos
        WHERE id_usuario = $1
          AND fecha >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', fecha)
      ) sub
      GROUP BY mes
      ORDER BY MIN(mes)
    `, [id]);

    // Últimas 5 transacciones (ingresos + gastos mezclados)
    const recientes = await pool.query(`
      SELECT 'ingreso' AS tipo, monto, descripcion, categoria, fecha FROM ingresos
      WHERE id_usuario = $1
      UNION ALL
      SELECT 'gasto' AS tipo, monto, descripcion, categoria, fecha FROM gastos
      WHERE id_usuario = $1
      ORDER BY fecha DESC
      LIMIT 5
    `, [id]);

    const totalIngresos = parseFloat(ingresos.rows[0].total);
    const totalGastos   = parseFloat(gastos.rows[0].total);

    res.json({
      resumen: {
        total_ingresos:  totalIngresos,
        total_gastos:    totalGastos,
        balance:         totalIngresos - totalGastos,
        tasa_ahorro:     totalIngresos > 0
          ? (((totalIngresos - totalGastos) / totalIngresos) * 100).toFixed(1)
          : 0,
      },
      gastos_por_categoria: porCategoria.rows,
      historial_6_meses:    historial.rows,
      transacciones_recientes: recientes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
}

module.exports = { getResumen };