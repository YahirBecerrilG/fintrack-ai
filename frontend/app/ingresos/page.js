'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmModal from '@/components/ConfirmModal';

import {
  DollarSign,
  Briefcase,
  Wallet,
  Laptop,
  Building,
  TrendingUp,
  GraduationCap,
  Package,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

const CATEGORIAS = ['General','Salario','Freelance','Negocio','Inversiones','Beca','Otros'];

const CAT_ICONS = {
  General: Briefcase,
  Salario: Wallet,
  Freelance: Laptop,
  Negocio: Building,
  Inversiones: TrendingUp,
  Beca: GraduationCap,
  Otros: Package
};

function FormModal({ onClose, onSaved, editData }) {
  const [form, setForm] = useState({
    monto: editData?.monto || '',
    descripcion: editData?.descripcion || '',
    categoria: editData?.categoria || 'Salario',
    fecha: editData?.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">

        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <DollarSign size={18}/>
            {editData ? 'Editar ingreso' : 'Nuevo ingreso'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* MONTO */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Monto
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.monto}
                onChange={e => setForm({...form, monto: e.target.value})}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
              placeholder="Ej: Pago de nómina"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.categoria}
              onChange={e => setForm({...form, categoria: e.target.value})}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>

            <input
              type="date"
              required
              value={form.fecha}
              onChange={e => setForm({...form, fecha: e.target.value})}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl"
            >
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
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filtro, setFiltro] = useState('Todas');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchIngresos();
  }, []);

  async function fetchIngresos() {
    try {
      const res = await api.get('/api/ingresos');
      setIngresos(res.data.ingresos);
    } catch {
      toast.error('Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/ingresos/${confirm.id}`);
      toast.success('Ingreso eliminado');
      setConfirm(null);
      fetchIngresos();
    } catch {
      toast.error('Error al eliminar');
    }
  }

  const filtrados = filtro === 'Todas'
    ? ingresos
    : ingresos.filter(i => i.categoria === filtro);

  const total = filtrados.reduce((s, i) => s + parseFloat(i.monto), 0);
  const fmt = n => `$${parseFloat(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

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

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ingresos</h2>
            <p className="text-sm text-gray-400">
              {filtrados.length} registros ·
              <span className="text-green-600 font-semibold ml-1">{fmt(total)}</span>
            </p>
          </div>

          <button
            onClick={() => { setEditando(null); setShowForm(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl
              text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus size={16}/>
            Nuevo ingreso
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 flex-wrap">
          {['Todas', ...CATEGORIAS].map(c => {
            const Icon = CAT_ICONS[c];
            return (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5
                  ${filtro === c
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-600'
                  }`}
              >
                {Icon && <Icon size={14}/>}
                {c}
              </button>
            );
          })}
        </div>

        {/* LISTA */}
        {filtrados.length === 0 ? (
          <EmptyState
            icon={<DollarSign size={28}/>}
            title="Sin ingresos"
            description="Agrega tu primer ingreso"
            action="Agregar ingreso"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {filtrados.map((ing) => {
              const Icon = CAT_ICONS[ing.categoria] || Briefcase;

              return (
                <div key={ing.id_ingreso}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-green-600"/>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800">
                        {ing.descripcion || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ing.categoria} · {ing.fecha?.split('T')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-semibold">
                      +{fmt(ing.monto)}
                    </span>

                    <button
                      onClick={() => { setEditando(ing); setShowForm(true); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil size={16}/>
                    </button>

                    <button
                      onClick={() => setConfirm({ id: ing.id_ingreso })}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16}/>
                    </button>
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