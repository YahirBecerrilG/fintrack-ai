'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORES_PIE = ['#1A73E8','#34A853','#FF6D00','#8B44E8','#E85B1A','#0D2B55','#F4B400','#EA4335'];

const CATEGORIA_ICONS = {
  Comida:'🍔', Transporte:'🚗', Salud:'🏥', Entretenimiento:'🎮',
  Ropa:'👕', Educacion:'📚', Servicios:'💡', Otros:'📦',
  General:'💼', Salario:'💰', Freelance:'💻', Negocio:'🏢', Inversiones:'📈'
};

// ── Tarjeta de métrica ──────────────────────────────────
function MetricCard({ label, value, sub, color, icon }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// ── Tooltip personalizado para el BarChart ──────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ${parseFloat(p.value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('usuario');
    if (!token) { router.push('/login'); return; }
    setUsuario(JSON.parse(user));
    fetchResumen();
  }, []);

  async function fetchResumen() {
    try {
      const res = await api.get('/api/resumen');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  }

  const fmt = (n) =>
    `$${parseFloat(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  const { resumen, gastos_por_categoria, historial_6_meses, transacciones_recientes } = data || {};
  const balancePositivo = (resumen?.balance || 0) >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-xl">FinTrack AI</span>
          <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <Link href="/dashboard" className="text-blue-600 border-b-2 border-blue-600 pb-0.5">Dashboard</Link>
          <Link href="/ingresos"  className="hover:text-blue-600 transition-colors">Ingresos</Link>
          <Link href="/gastos"    className="hover:text-blue-600 transition-colors">Gastos</Link>
          <Link href="/deudas"    className="hover:text-blue-600 transition-colors">Deudas</Link>
          <Link href="/asistente" className="hover:text-blue-600 transition-colors">IA ✨</Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">👤 {usuario?.nombre}</span>
          <button onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
            Salir
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Bienvenida */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Buen día, {usuario?.nombre?.split(' ')[0]} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Resumen financiero del mes actual
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/ingresos"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              + Ingreso
            </Link>
            <Link href="/gastos"
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              + Gasto
            </Link>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Ingresos del mes"
            value={fmt(resumen?.total_ingresos)}
            sub="Este mes"
            color="border-green-500"
            icon="💰"
          />
          <MetricCard
            label="Gastos del mes"
            value={fmt(resumen?.total_gastos)}
            sub="Este mes"
            color="border-red-400"
            icon="💸"
          />
          <MetricCard
            label="Balance"
            value={fmt(resumen?.balance)}
            sub={balancePositivo ? '¡Vas bien!' : 'Cuidado con los gastos'}
            color={balancePositivo ? 'border-blue-500' : 'border-orange-400'}
            icon={balancePositivo ? '📈' : '⚠️'}
          />
          <MetricCard
            label="Tasa de ahorro"
            value={`${resumen?.tasa_ahorro || 0}%`}
            sub="Del ingreso mensual"
            color="border-purple-500"
            icon="🏦"
          />
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bar Chart — Historial 6 meses */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              Ingresos vs Gastos — Últimos 6 meses
            </h3>
            {historial_6_meses?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={historial_6_meses} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total_ingresos" name="Ingresos" fill="#34A853" radius={[4,4,0,0]} />
                  <Bar dataKey="total_gastos"   name="Gastos"   fill="#EA4335" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">
                Sin datos suficientes aún
              </div>
            )}
          </div>

          {/* Pie Chart — Gastos por categoría */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              Gastos por categoría (este mes)
            </h3>
            {gastos_por_categoria?.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={gastos_por_categoria} dataKey="total"
                      nameKey="categoria" cx="50%" cy="50%"
                      outerRadius={80} innerRadius={45}>
                      {gastos_por_categoria.map((_, i) => (
                        <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Leyenda manual */}
                <div className="flex-1 space-y-2">
                  {gastos_por_categoria.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORES_PIE[i % COLORES_PIE.length] }} />
                        <span className="text-gray-600">
                          {CATEGORIA_ICONS[cat.categoria] || ''} {cat.categoria}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-700">{fmt(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">
                Sin gastos este mes
              </div>
            )}
          </div>
        </div>

        {/* Transacciones recientes + Alerta de balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Últimas transacciones */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-800">Últimas transacciones</h3>
              <div className="flex gap-2 text-xs">
                <Link href="/ingresos" className="text-green-600 hover:underline font-medium">Ver ingresos</Link>
                <span className="text-gray-300">|</span>
                <Link href="/gastos"   className="text-red-500 hover:underline font-medium">Ver gastos</Link>
              </div>
            </div>
            {transacciones_recientes?.length > 0 ? (
              <div className="space-y-3">
                {transacciones_recientes.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base
                        ${t.tipo === 'ingreso' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {CATEGORIA_ICONS[t.categoria] || (t.tipo === 'ingreso' ? '💵' : '💸')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {t.descripcion || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.categoria} · {t.fecha?.split('T')[0]}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${
                      t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {t.tipo === 'ingreso' ? '+' : '-'}{fmt(t.monto)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-300 text-sm">
                Aún no hay transacciones registradas
              </div>
            )}
          </div>

          {/* Panel lateral — Salud financiera */}
          <div className="space-y-4">
            {/* Alerta de balance */}
            <div className={`rounded-2xl p-5 ${
              balancePositivo
                ? 'bg-green-50 border border-green-100'
                : 'bg-orange-50 border border-orange-100'
            }`}>
              <p className="text-sm font-bold text-gray-700 mb-1">
                {balancePositivo ? '✅ Salud financiera' : '⚠️ Alerta financiera'}
              </p>
              <p className="text-xs text-gray-500">
                {balancePositivo
                  ? `Estás ahorrando el ${resumen?.tasa_ahorro}% de tus ingresos. ¡Sigue así!`
                  : 'Tus gastos superan tus ingresos este mes. Considera revisar tus gastos.'}
              </p>
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Accesos rápidos</h3>
              <div className="space-y-2">
                {[
                  { href:'/ingresos',  icon:'💰', label:'Registrar ingreso',    color:'text-green-600' },
                  { href:'/gastos',    icon:'💸', label:'Registrar gasto',      color:'text-red-500'   },
                  { href:'/deudas',    icon:'🧾', label:'Ver mis deudas',       color:'text-orange-500'},
                  { href:'/asistente', icon:'🤖', label:'Consultar IA',         color:'text-purple-600'},
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <span>{item.icon}</span>
                    <span className={`text-sm font-medium ${item.color} group-hover:underline`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}