'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const ESTADO_COLOR = {
  activa:  { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Activa'  },
  pagada:  { bg: 'bg-green-100',  text: 'text-green-600',  label: 'Pagada'  },
  vencida: { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Vencida' },
};

// ── Navbar reutilizable ─────────────────────────────────
function Navbar() {
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };
  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
      <span className="text-blue-600 font-bold text-xl">FinTrack AI</span>
      <div className="flex gap-6 text-sm font-medium text-gray-500">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link href="/ingresos"  className="hover:text-blue-600">Ingresos</Link>
        <Link href="/gastos"    className="hover:text-blue-600">Gastos</Link>
        <Link href="/deudas"    className="text-blue-600 border-b-2 border-blue-600 pb-0.5">Deudas</Link>
        <Link href="/asistente" className="hover:text-blue-600">IA ✨</Link>
      </div>
      <button onClick={logout}
        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">
        Salir
      </button>
    </nav>
  );
}

// ── Modal formulario deuda ──────────────────────────────
function FormDeuda({ onClose, onSaved, editData }) {
  const [form, setForm] = useState({
    nombre:      editData?.nombre      || '',
    monto_total: editData?.monto_total || '',
    interes:     editData?.interes     || '',
    fecha_inicio: editData?.fecha_inicio?.split('T')[0] || new Date().toISOString().split('T')[0],
    fecha_fin:    editData?.fecha_fin?.split('T')[0]    || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editData) {
        await api.put(`/api/deudas/${editData.id_deuda}`, {
          ...form, saldo_actual: editData.saldo_actual, estado: editData.estado
        });
      } else {
        await api.post('/api/deudas', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {editData ? 'Editar deuda' : 'Nueva deuda'}
        </h3>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la deuda</label>
            <input type="text" required value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Tarjeta Banamex"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto total ($)</label>
              <input type="number" required min="0.01" step="0.01" value={form.monto_total}
                onChange={e => setForm({...form, monto_total: e.target.value})}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interés anual (%)</label>
              <input type="number" min="0" max="200" step="0.1" value={form.interes}
                onChange={e => setForm({...form, interes: e.target.value})}
                placeholder="Ej: 24"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input type="date" value={form.fecha_inicio}
                onChange={e => setForm({...form, fecha_inicio: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
              <input type="date" value={form.fecha_fin}
                onChange={e => setForm({...form, fecha_fin: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {loading ? 'Guardando...' : editData ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal Plan de Pagos ─────────────────────────────────
function ModalPlan({ deuda, onClose }) {
  const [plan, setPlan]     = useState(null);
  const [meses, setMeses]   = useState(12);
  const [loading, setLoading] = useState(true);
  const [showPago, setShowPago] = useState(false);
  const [montoPago, setMontoPago] = useState('');
  const [msgPago, setMsgPago]     = useState('');

  useEffect(() => { fetchPlan(); }, [meses]);

  async function fetchPlan() {
    setLoading(true);
    try {
      const res = await api.get(`/api/deudas/${deuda.id_deuda}/plan?meses=${meses}`);
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePago(e) {
    e.preventDefault();
    try {
      const res = await api.post(`/api/deudas/${deuda.id_deuda}/pagos`, { monto: montoPago });
      setMsgPago(res.data.message);
      setMontoPago('');
      fetchPlan();
    } catch (err) {
      setMsgPago(err.response?.data?.error || 'Error al registrar pago');
    }
  }

  const fmt = (n) => `$${parseFloat(n||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;

  // Datos para la mini gráfica de amortización
  const chartData = plan?.tabla_amortizacion?.filter((_,i) => i % 3 === 0).map(row => ({
    mes:      `M${row.mes}`,
    capital:  row.capital,
    interes:  row.interes,
    saldo:    row.saldo,
  })) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{deuda.nombre}</h3>
              <p className="text-orange-100 text-sm mt-1">Plan de pagos generado automáticamente</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          {/* Selector de plazo */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[6, 12, 18, 24, 36].map(m => (
              <button key={m} onClick={() => setMeses(m)}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                  meses === m
                    ? 'bg-white text-orange-600'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}>
                {m} meses
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Calculando plan...</div>
          ) : (
            <>
              {/* Métricas del plan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Saldo actual',    value: fmt(plan.deuda.saldo_actual), color: 'border-orange-400' },
                  { label: 'Cuota mensual',   value: fmt(plan.plan.cuota_mensual), color: 'border-blue-400'   },
                  { label: 'Total a pagar',   value: fmt(plan.plan.total_a_pagar), color: 'border-gray-300'   },
                  { label: 'Total intereses', value: fmt(plan.plan.total_intereses), color: 'border-red-300'  },
                ].map((m, i) => (
                  <div key={i} className={`border-l-4 ${m.color} pl-3 py-1`}>
                    <p className="text-xs text-gray-400">{m.label}</p>
                    <p className="text-base font-bold text-gray-800">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Gráfica amortización */}
              {chartData.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Distribución capital vs interés por mes</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => fmt(v)} />
                      <Bar dataKey="capital" name="Capital"  stackId="a" fill="#34A853" radius={[0,0,0,0]} />
                      <Bar dataKey="interes" name="Interés"  stackId="a" fill="#EA4335" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tabla de amortización */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Tabla de amortización (primeros {Math.min(plan.tabla_amortizacion.length, 12)} meses)
                </p>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Mes','Cuota','Capital','Interés','Saldo'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {plan.tabla_amortizacion.slice(0, 12).map((row) => (
                        <tr key={row.mes} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 font-medium text-gray-700">{row.mes}</td>
                          <td className="px-3 py-2 text-blue-600">{fmt(row.cuota)}</td>
                          <td className="px-3 py-2 text-green-600">{fmt(row.capital)}</td>
                          <td className="px-3 py-2 text-red-500">{fmt(row.interes)}</td>
                          <td className="px-3 py-2 text-gray-600">{fmt(row.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Registrar pago */}
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-800 mb-3">Registrar abono</p>
                {msgPago && (
                  <div className={`text-sm rounded-lg p-2 mb-3 ${
                    msgPago.includes('🎉') || msgPago.includes('correctamente')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {msgPago}
                  </div>
                )}
                <form onSubmit={handlePago} className="flex gap-3">
                  <input type="number" min="0.01" step="0.01"
                    value={montoPago}
                    onChange={e => setMontoPago(e.target.value)}
                    placeholder="Monto del abono"
                    required
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                    Abonar
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-2">
                  Cuota sugerida: <span className="font-semibold text-blue-600">{fmt(plan.plan.cuota_mensual)}</span> / mes
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────
export default function DeudasPage() {
  const router   = useRouter();
  const [deudas, setDeudas]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState(null);
  const [planDeuda, setPlanDeuda] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchDeudas();
  }, []);

  async function fetchDeudas() {
    try {
      const res = await api.get('/api/deudas');
      setDeudas(res.data.deudas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta deuda y todos sus pagos?')) return;
    try {
      await api.delete(`/api/deudas/${id}`);
      fetchDeudas();
    } catch (err) {
      console.error(err);
    }
  }

  const fmt    = n => `$${parseFloat(n||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;
  const activas = deudas.filter(d => d.estado === 'activa');
  const totalDeuda = activas.reduce((s,d) => s + parseFloat(d.saldo_actual), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Modales */}
      {showForm && (
        <FormDeuda
          editData={editando}
          onClose={() => { setShowForm(false); setEditando(null); }}
          onSaved={() => { setShowForm(false); setEditando(null); fetchDeudas(); }}
        />
      )}
      {planDeuda && (
        <ModalPlan deuda={planDeuda} onClose={() => { setPlanDeuda(null); fetchDeudas(); }} />
      )}

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mis Deudas</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {activas.length} deuda{activas.length !== 1 ? 's' : ''} activa{activas.length !== 1 ? 's' : ''}
              {activas.length > 0 && (
                <> · Saldo total: <span className="text-orange-500 font-semibold">{fmt(totalDeuda)}</span></>
              )}
            </p>
          </div>
          <button onClick={() => { setEditando(null); setShowForm(true); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + Nueva deuda
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">Cargando...</div>
        ) : deudas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-gray-700 font-semibold">¡Sin deudas registradas!</p>
            <p className="text-gray-400 text-sm mt-1">Cuando tengas un crédito activo, agrégalo aquí.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deudas.map(d => {
              const progreso = d.monto_total > 0
                ? ((d.monto_total - d.saldo_actual) / d.monto_total * 100)
                : 0;
              const est = ESTADO_COLOR[d.estado] || ESTADO_COLOR.activa;

              return (
                <div key={d.id_deuda}
                  className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-lg">{d.nombre}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${est.bg} ${est.text}`}>
                          {est.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Interés: {d.interes}% anual
                        {d.fecha_fin && ` · Vence: ${d.fecha_fin?.split('T')[0]}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-500">{fmt(d.saldo_actual)}</p>
                      <p className="text-xs text-gray-400">de {fmt(d.monto_total)}</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Pagado: {fmt(d.total_pagado)}</span>
                      <span>{progreso.toFixed(1)}% completado</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progreso, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setPlanDeuda(d)}
                      className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-2 rounded-lg text-sm transition-colors">
                      📊 Ver plan de pagos
                    </button>
                    <button
                      onClick={() => { setEditando(d); setShowForm(true); }}
                      className="px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-2 rounded-lg text-sm transition-colors">
                      Editar
                    </button>
                    {d.estado !== 'pagada' && (
                      <button
                        onClick={() => handleDelete(d.id_deuda)}
                        className="px-4 bg-red-50 hover:bg-red-100 text-red-500 font-semibold py-2 rounded-lg text-sm transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}