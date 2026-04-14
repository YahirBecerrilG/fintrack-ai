'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

import {
  Utensils,
  Car,
  HeartPulse,
  Gamepad2,
  Shirt,
  BookOpen,
  Lightbulb,
  Package,
  Plus,
  Pencil,
  Trash2,
  DollarSign
} from 'lucide-react';

const CATEGORIAS = ['Comida', 'Transporte', 'Salud', 'Entretenimiento', 'Ropa', 'Educacion', 'Servicios', 'Otros'];

const CAT_ICONS = {
  Comida: Utensils,
  Transporte: Car,
  Salud: HeartPulse,
  Entretenimiento: Gamepad2,
  Ropa: Shirt,
  Educacion: BookOpen,
  Servicios: Lightbulb,
  Otros: Package
};

export default function GastosPage() {
  const router = useRouter();
  const [gastos, setGastos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [form, setForm] = useState({
    monto: '',
    descripcion: '',
    categoria: 'Comida',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchGastos();
  }, []);

  async function fetchGastos() {
    try {
      const res = await api.get('/api/gastos');
      setGastos(res.data.gastos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openCreate() {
    setEditando(null);
    setForm({
      monto: '',
      descripcion: '',
      categoria: 'Comida',
      fecha: new Date().toISOString().split('T')[0]
    });
    setError('');
    setShowForm(true);
  }

  function openEdit(gasto) {
    setEditando(gasto.id_gasto);
    setForm({
      monto: gasto.monto,
      descripcion: gasto.descripcion || '',
      categoria: gasto.categoria,
      fecha: gasto.fecha?.split('T')[0] || ''
    });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editando) {
        await api.put(`/api/gastos/${editando}`, form);
      } else {
        await api.post('/api/gastos', form);
      }
      setShowForm(false);
      fetchGastos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
      await api.delete(`/api/gastos/${id}`);
      fetchGastos();
    } catch (err) {
      console.error(err);
    }
  }

  const gastosFiltrados = filtroCategoria === 'Todas'
    ? gastos
    : gastos.filter(g => g.categoria === filtroCategoria);

  const total = gastosFiltrados.reduce((sum, g) => sum + parseFloat(g.monto), 0);
  const fmt = n => `$${parseFloat(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  if (loading) return <LoadingSpinner text="Cargando gastos..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gastos</h2>
            <p className="text-sm text-gray-400">
              Total:
              <span className="text-red-500 font-semibold ml-1">
                -{fmt(total)}
              </span>
            </p>
          </div>

          <button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl
              text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus size={16}/>
            Nuevo gasto
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 flex-wrap">
          {['Todas', ...CATEGORIAS].map(c => {
            const Icon = CAT_ICONS[c];
            return (
              <button
                key={c}
                onClick={() => setFiltroCategoria(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5
                  ${filtroCategoria === c
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-600'
                  }`}
              >
                {Icon && <Icon size={14}/>}
                {c}
              </button>
            );
          })}
        </div>

        {/* MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">

              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign size={18}/>
                {editando ? 'Editar gasto' : 'Nuevo gasto'}
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                <input type="number" name="monto" value={form.monto}
                  onChange={handleChange} required min="0.01" step="0.01"
                  placeholder="Monto"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500"/>

                <input type="text" name="descripcion" value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500"/>

                <select name="categoria" value={form.categoria} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500">
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>

                <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500"/>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 py-2.5 rounded-xl">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LISTA */}
        {gastosFiltrados.length === 0 ? (
          <EmptyState
            icon={<DollarSign size={28}/>}
            title="Sin gastos"
            description="Agrega tu primer gasto"
            action="Agregar gasto"
            onAction={openCreate}
          />
        ) : (
          <div className="space-y-3">
            {gastosFiltrados.map(g => {
              const Icon = CAT_ICONS[g.categoria] || Package;

              return (
                <div key={g.id_gasto}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-red-500"/>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800">
                        {g.descripcion || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {g.categoria} · {g.fecha?.split('T')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-red-500 font-semibold">
                      -{fmt(g.monto)}
                    </span>

                    <button onClick={() => openEdit(g)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil size={16}/>
                    </button>

                    <button onClick={() => handleDelete(g.id_gasto)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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