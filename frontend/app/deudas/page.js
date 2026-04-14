'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmModal from '@/components/ConfirmModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const ESTADO_COLOR = {
  activa:  { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Activa'  },
  pagada:  { bg: 'bg-green-100',  text: 'text-green-600',  label: 'Pagada'  },
  vencida: { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Vencida' },
};

// ── Modal formulario nueva deuda ─────────────────────
function FormModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre:      '',
    monto_total: '',
    interes:     '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin:    '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (!form.monto_total || parseFloat(form.monto_total) <= 0) {
      toast.error('El monto debe ser mayor a 0'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/deudas', form);
      toast.success('Deuda registrada ✓');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-800">🧾 Nueva deuda</h3>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8
              flex items-center justify-center rounded-lg hover:bg-gray-100">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Nombre de la deuda
            </label>
            <input type="text" required
              value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Tarjeta Banamex, Préstamo personal"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Monto total ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" required min="0.01" step="0.01"
                  value={form.monto_total}
                  onChange={e => setForm({...form, monto_total: e.target.value})}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Interés anual (%)
              </label>
              <input type="number" min="0" max="200" step="0.1"
                value={form.interes}
                onChange={e => setForm({...form, interes: e.target.value})}
                placeholder="Ej: 24"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Fecha inicio
              </label>
              <input type="date"
                value={form.fecha_inicio}
                onChange={e => setForm({...form, fecha_inicio: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Fecha límite
              </label>
              <input type="date"
                value={form.fecha_fin}
                onChange={e => setForm({...form, fecha_fin: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300
                text-white font-bold py-2.5 rounded-xl transition-colors">
              {loading ? 'Guardando...' : 'Guardar deuda'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700
                font-bold py-2.5 rounded-xl transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalPlan({ deuda, onClose }) {
  const [plan, setPlan]   = useState(null);
  const [meses, setMeses] = useState(12);
  const [loading, setLoading] = useState(true);

  // ── FIX: meses va directo como parámetro, no como closure
  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      setPlan(null); // limpia la vista anterior mientras carga
      try {
        const res = await api.get(`/api/deudas/${deuda.id_deuda}/plan?meses=${meses}`);
        setPlan(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [meses, deuda.id_deuda]); // ambas dependencias declaradas correctamente

  // ... resto igual

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

  const fmt = n => `$${parseFloat(n||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;

  const chartData = plan?.tabla_amortizacion?.slice(0, 12).map(row => ({
    mes: `M${row.mes}`,
    capital: row.capital,
    interes: row.interes
  })) || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 rounded-t-2xl text-white">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-bold">{deuda.nombre}</h3>
              <p className="text-xs opacity-80">Plan de pagos</p>
            </div>
            <button onClick={onClose} className="text-xl">×</button>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {[6,12,18,24].map(m => (
              <button key={m}
                onClick={() => setMeses(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  meses === m ? 'bg-white text-orange-600' : 'bg-white/20'
                }`}>
                {m} meses
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Calculando...</div>
          ) : (
            <>
              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Saldo</p>
                  <p className="font-bold">{fmt(plan.deuda.saldo_actual)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cuota</p>
                  <p className="font-bold text-blue-600">{fmt(plan.plan.cuota_mensual)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-bold">{fmt(plan.plan.total_a_pagar)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Intereses</p>
                  <p className="font-bold text-red-500">{fmt(plan.plan.total_intereses)}</p>
                </div>
              </div>

              {/* Gráfica */}
              <div>
                <p className="text-sm font-semibold mb-2 text-gray-700">Capital vs Interés</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => fmt(v)} />
                    <Bar dataKey="capital" stackId="a" fill="#34A853" />
                    <Bar dataKey="interes" stackId="a" fill="#EA4335" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Mes','Cuota','Capital','Interés','Saldo'].map(h => (
                        <th key={h} className="p-2 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plan.tabla_amortizacion.slice(0, 8).map(row => (
                      <tr key={row.mes} className="border-t">
                        <td className="p-2">{row.mes}</td>
                        <td className="p-2 text-blue-600">{fmt(row.cuota)}</td>
                        <td className="p-2 text-green-600">{fmt(row.capital)}</td>
                        <td className="p-2 text-red-500">{fmt(row.interes)}</td>
                        <td className="p-2">{fmt(row.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────
export default function DeudasPage() {
  const router = useRouter();
  const [deudas,    setDeudas]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [planDeuda, setPlanDeuda] = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [confirm,   setConfirm]   = useState(null); // { id, nombre }

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchDeudas();
  }, []);

  async function fetchDeudas() {
    try {
      const res = await api.get('/api/deudas');
      setDeudas(res.data.deudas);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/deudas/${confirm.id}`);
      toast.success('Deuda eliminada ✓');
      setConfirm(null);
      fetchDeudas();
    } catch {
      toast.error('Error al eliminar la deuda');
    }
  }

  const fmt     = n => `$${parseFloat(n||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;
  const activas = deudas.filter(d => d.estado === 'activa');

  if (loading) return <LoadingSpinner text="Cargando deudas..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Modales */}
      {showForm && (
        <FormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchDeudas(); }}
        />
      )}
      {planDeuda && (
        <ModalPlan deuda={planDeuda} onClose={() => setPlanDeuda(null)} />
      )}
      {confirm && (
        <ConfirmModal
          title="¿Eliminar deuda?"
          message={`Se eliminará "${confirm.nombre}" y todos sus pagos. Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <main className="max-w-5xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in-up">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Mis Deudas</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {activas.length} deuda{activas.length !== 1 ? 's' : ''} activa{activas.length !== 1 ? 's' : ''}
              {activas.length > 0 && (
                <> · Saldo total: <span className="text-orange-500 font-bold">
                  {fmt(activas.reduce((s,d) => s + parseFloat(d.saldo_actual), 0))}
                </span></>
              )}
            </p>
          </div>
          {/* ── BOTÓN AGREGAR ── */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white
              px-4 py-2.5 rounded-xl text-sm font-bold transition-colors
              shadow-sm hover:shadow-md">
            + Nueva deuda
          </button>
        </div>

        {deudas.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Sin deudas registradas"
            description="Cuando tengas un crédito activo, agrégalo aquí para hacer seguimiento."
            action="+ Agregar deuda"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-4">
            {deudas.map(d => {
              const progreso = d.monto_total > 0
                ? ((d.monto_total - d.saldo_actual) / d.monto_total) * 100
                : 0;
              const est = ESTADO_COLOR[d.estado] || ESTADO_COLOR.activa;

              return (
                <div key={d.id_deuda}
                  className="bg-white rounded-2xl shadow-sm p-5 card-hover animate-fade-in-up">

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{d.nombre}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${est.bg} ${est.text}`}>
                          {est.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {d.interes}% anual
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-500 text-lg">{fmt(d.saldo_actual)}</p>
                      <p className="text-xs text-gray-400">de {fmt(d.monto_total)}</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3 mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Pagado: {fmt(d.total_pagado)}</span>
                      <span>{progreso.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progreso, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* ── BOTONES ── */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlanDeuda(d)}
                      className="flex-1 bg-orange-50 hover:bg-orange-100
                        text-orange-600 font-semibold py-2 rounded-lg text-sm transition-colors">
                      📊 Ver plan
                    </button>
                    {/* ── BOTÓN ELIMINAR ── */}
                    {d.estado !== 'pagada' && (
                      <button
                        onClick={() => setConfirm({ id: d.id_deuda, nombre: d.nombre })}
                        className="px-4 bg-red-50 hover:bg-red-100
                          text-red-500 font-semibold py-2 rounded-lg text-sm transition-colors">
                        🗑️ Eliminar
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