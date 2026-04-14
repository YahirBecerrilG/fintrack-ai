'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORES_PIE = ['#16A34A','#DC2626','#F59E0B','#6366F1','#0EA5E9','#8B5CF6','#EF4444','#14B8A6'];

// Tooltip
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

  const fmt = (n) =>
    `$${parseFloat(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const { resumen, gastos_por_categoria, historial_6_meses, transacciones_recientes } = data || {};
  const balancePositivo = (resumen?.balance || 0) >= 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* ✅ Navbar GLOBAL */}
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Buen día, {usuario?.nombre?.split(' ')[0]}
            </h2>
            <p className="text-gray-400 text-sm">
              Resumen financiero del mes actual
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/ingresos"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <TrendingUp size={16}/> Ingreso
            </Link>

            <Link href="/gastos"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <TrendingDown size={16}/> Gasto
            </Link>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Ingresos" value={fmt(resumen?.total_ingresos)} icon={TrendingUp} color="green"/>
          <StatCard label="Gastos" value={fmt(resumen?.total_gastos)} icon={TrendingDown} color="red"/>
          <StatCard label="Balance" value={fmt(resumen?.balance)} icon={Wallet} color={balancePositivo ? 'green' : 'orange'}/>
          <StatCard label="Ahorro" value={`${resumen?.tasa_ahorro || 0}%`} icon={PiggyBank} color="purple"/>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bar */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Ingresos vs Gastos — Últimos 6 meses
            </h3>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={historial_6_meses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total_ingresos" fill="#16A34A" />
                <Bar dataKey="total_gastos" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie + leyenda RESTAURADA */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Gastos por categoría
            </h3>

            {gastos_por_categoria?.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-4">

                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={gastos_por_categoria} dataKey="total" nameKey="categoria">
                      {gastos_por_categoria.map((_, i) => (
                        <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="w-full space-y-2">
                  {gastos_por_categoria.map((cat, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-600">{cat.categoria}</span>
                      <span className="font-semibold">{fmt(cat.total)}</span>
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

        {/* Transacciones */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Últimas transacciones
          </h3>

          {transacciones_recientes?.map((t, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="text-sm text-gray-800">{t.descripcion}</p>
                <p className="text-xs text-gray-400">{t.categoria}</p>
              </div>
              <span className={t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'}>
                {t.tipo === 'ingreso' ? '+' : '-'}{fmt(t.monto)}
              </span>
            </div>
          ))}
        </div>

        {/* Estado */}
        <div className={`rounded-2xl p-5 flex gap-3 border ${
          balancePositivo ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'
        }`}>
          <AlertTriangle />
          <div>
            <p className="text-sm font-semibold">
              {balancePositivo ? 'Buen estado financiero' : 'Atención requerida'}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}