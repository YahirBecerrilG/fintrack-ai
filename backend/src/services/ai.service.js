const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL          = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `
Eres FinTrack AI, un asesor financiero personal inteligente y empático.
Tu objetivo es ayudar al usuario a mejorar su salud financiera.

Reglas:
- Responde SIEMPRE en español
- Sé conciso, claro y accionable
- Usa números concretos cuando los tengas disponibles
- Da máximo 3-5 recomendaciones por análisis
- Usa emojis con moderación para hacer la lectura amigable
- Si el balance es negativo, sé empático pero directo
- Cuando hables de montos usa el formato $X,XXX.XX MXN
- NO hables de otra cosa que no sea finanzas personales, ahorro, gastos, deudas o inversiones, si el usuario pregunta algo fuera de esto, redirígelo amablemente al tema financiero
- NO respondas ninguna pregunta que no tenga que ver con finanzas personales, si el usuario pregunta algo fuera de esto, redirígelo amablemente al tema financiero 
`;

async function callAI(messages) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization':  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type':   'application/json',
        'HTTP-Referer':   'http://localhost:3000',
        'X-Title':        'FinTrack AI',
      },
    }
  );
  return response.data.choices[0].message.content;
}

// ── Análisis completo de finanzas ───────────────────────
async function analizarFinanzas({ resumen, gastosPorCategoria, deudas }) {
  const prompt = `
Analiza las siguientes finanzas personales del mes actual y dame recomendaciones:

RESUMEN DEL MES:
- Ingresos totales: $${resumen.total_ingresos} MXN
- Gastos totales:   $${resumen.total_gastos} MXN
- Balance:          $${resumen.balance} MXN
- Tasa de ahorro:   ${resumen.tasa_ahorro}%

GASTOS POR CATEGORÍA:
${gastosPorCategoria.map(g => `- ${g.categoria}: $${g.total} MXN`).join('\n')}

DEUDAS ACTIVAS:
${deudas.length === 0
  ? '- Sin deudas activas'
  : deudas.map(d => `- ${d.nombre}: $${d.saldo_actual} MXN al ${d.interes}% anual`).join('\n')
}

Dame un análisis claro con:
1. Diagnóstico de la situación actual
2. Top 3 recomendaciones de ahorro específicas
3. Estrategia para las deudas (si hay)
4. Una meta financiera alcanzable para el próximo mes
`;

  return await callAI([{ role: 'user', content: prompt }]);
}

// ── Chat libre con contexto financiero ─────────────────
async function chatFinanciero(historialMensajes, contexto) {
  const contextPrompt = contexto ? `
CONTEXTO FINANCIERO DEL USUARIO (úsalo para dar respuestas personalizadas):
- Ingresos este mes: $${contexto.total_ingresos} MXN
- Gastos este mes: $${contexto.total_gastos} MXN
- Balance: $${contexto.balance} MXN
- Tasa de ahorro: ${contexto.tasa_ahorro}%
- Deudas activas: ${contexto.num_deudas || 0}
` : '';

  const messages = contexto
    ? [
        { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
        ...historialMensajes,
      ]
    : historialMensajes;

  return await callAI(
    historialMensajes // callAI ya agrega el system prompt
  );
}

// ── Recomendación para una deuda específica ─────────────
async function optimizarDeuda({ deuda, resumen }) {
  const prompt = `
El usuario tiene la siguiente deuda:
- Nombre: ${deuda.nombre}
- Saldo actual: $${deuda.saldo_actual} MXN
- Interés anual: ${deuda.interes}%
- Fecha límite: ${deuda.fecha_fin || 'No definida'}

Su situación financiera mensual:
- Ingresos: $${resumen.total_ingresos} MXN
- Gastos: $${resumen.total_gastos} MXN
- Dinero disponible: $${resumen.balance} MXN

Dame:
1. ¿Cuánto debería abonar mensualmente para liquidarla lo antes posible?
2. ¿Cuánto pagará en intereses si solo paga el mínimo (5% del saldo)?
3. ¿Qué estrategia recomiendas: avalancha o bola de nieve?
4. Un tip concreto para acelerar el pago de esta deuda
`;

  return await callAI([{ role: 'user', content: prompt }]);
}

module.exports = { analizarFinanzas, chatFinanciero, optimizarDeuda, callAI };