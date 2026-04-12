'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmModal from '@/components/ConfirmModal';

const CATEGORIAS = ['General','Salario','Freelance','Negocio','Inversiones','Beca','Otros'];

const CAT_ICONS = {
  General:'💼', Salario:'💰', Freelance:'💻',
  Negocio:'🏢', Inversiones:'📈', Beca:'🎓', Otros:'📦'
};

function FormModal({ onClose, onSaved, editData }) {
  const [form, setForm] = useState({
    monto:       editData?.monto       || '',
    descripcion: editData?.descripcion || '',
    categoria:   editData?.categoria   || 'Salario',
    fecha:       editData?.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.monto || parseFloat(form.monto) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    setLoading(true);
    try {
      if (editData) {
        await api.put(`/api/ingresos/${editData.id_ingreso}`, form);
        toast.success('Ingreso actualizado ✓');
      } else {
        await api.post('/api/ingresos', form);
        toast.success('Ingreso registrado ✓');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm
      flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4
        animate-fade-in-up">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-800">
            {editData ? '✏️ Editar ingreso' : '💰 Nuevo ingreso'}
          </h3>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8
              flex items-center justify-center rounded-lg hover:bg-gray-100">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Monto ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input type="number" min="0.01" step="0.01" required
                value={form.monto}
                onChange={e => setForm({...form, monto: e.target.value})}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Descripción</label>
            <input type="text" value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
              placeholder="Ej: Pago de nómina quincenal"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Categoría</label>
              <select value={form.categoria}
                onChange={e => setForm({...form, categoria: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Fecha</label>
              <input type="date" required value={form.fecha}
                onChange={e => setForm({...form, fecha: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300
                text-white font-bold py-2.5 rounded-xl transition-colors">
              {loading ? 'Guardando...' : editData ? 'Actualizar' : 'Guardar'}
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

export default function IngresosPage() {
  const router = useRouter();
  const [ingresos, setIngresos]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState(null);
  const [confirm,  setConfirm]    = useState(null); // { id }
  const [filtro,   setFiltro]     = useState('Todas');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchIngresos();
  }, []);

  async function fetchIngresos() {
    try {
      const res = await api.get('/api/ingresos');
      setIngresos(res.data.ingresos);
    } catch { toast.error('Error al cargar ingresos'); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/ingresos/${confirm.id}`);
      toast.success('Ingreso eliminado');
      setConfirm(null);
      fetchIngresos();
    } catch { toast.error('Error al eliminar'); }
  }

  const filtrados = filtro === 'Todas'
    ? ingresos
    : ingresos.filter(i => i.categoria === filtro);

  const total = filtrados.reduce((s, i) => s + parseFloat(i.monto), 0);
  const fmt   = n => `$${parseFloat(n||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;

  if (loading) return <LoadingSpinner text="Cargando ingresos..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showForm && (
        <FormModal
          editData={editando}
          onClose={() => { setShowForm(false); setEditando(null); }}
          onSaved={() => { setShowForm(false); setEditando(null); fetchIngresos(); }}
        />
      )}
      {confirm && (
        <ConfirmModal
          title="¿Eliminar ingreso?"
          message="Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <main className="max-w-4xl mx-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in-up">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Mis Ingresos</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''} ·
              <span className="text-green-600 font-bold ml-1">{fmt(total)}</span>
            </p>
          </div>
          <button
            onClick={() => { setEditando(null); setShowForm(true); }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5
              rounded-xl text-sm font-bold transition-colors shadow-sm hover:shadow-md">
            + Nuevo ingreso
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap animate-fade-in-up delay-100">
          {['Todas', ...CATEGORIAS].map(c => (
            <button key={c} onClick={() => setFiltro(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filtro === c
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-600'
                }`}>
              {CAT_ICONS[c] || ''} {c}
            </button>
          ))}
        </div>

        {/* Lista */}
        {filtrados.length === 0 ? (
          <EmptyState
            icon="💰"
            title="Sin ingresos aquí"
            description="Registra tu primer ingreso para empezar a trackear tus finanzas."
            action="+ Agregar ingreso"
            onAction={() => { setEditando(null); setShowForm(true); }}
          />
        ) : (
          <div className="space-y-3">
            {filtrados.map((ing, i) => (
              <div key={ing.id_ingreso}
                className={`bg-white rounded-2xl shadow-sm p-4 flex items-center
                  justify-between card-hover animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center
                    justify-center text-xl flex-shrink-0">
                    {CAT_ICONS[ing.categoria] || '💼'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {ing.descripcion || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ing.categoria} · {ing.fecha?.split('T')[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-black text-lg">
                    +{fmt(ing.monto)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditando(ing); setShowForm(true); }}
                      className="p-2 text-gray-400 hover:text-blue-600
                        hover:bg-blue-50 rounded-lg transition-colors text-sm">
                      ✏️
                    </button>
                    <button
                      onClick={() => setConfirm({ id: ing.id_ingreso })}
                      className="p-2 text-gray-400 hover:text-red-500
                        hover:bg-red-50 rounded-lg transition-colors text-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}