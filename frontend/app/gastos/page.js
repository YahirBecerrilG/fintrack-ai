'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';

const CATEGORIAS = ['Comida', 'Transporte', 'Salud', 'Entretenimiento', 'Ropa', 'Educacion', 'Servicios', 'Otros'];

const CATEGORIA_ICONS = {
  Comida: '🍔', Transporte: '🚗', Salud: '🏥', Entretenimiento: '🎮',
  Ropa: '👕', Educacion: '📚', Servicios: '💡', Otros: '📦'
};

export default function GastosPage() {
  const router = useRouter();
  const [gastos, setGastos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [form, setForm] = useState({
    monto: '', descripcion: '', categoria: 'Comida',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
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
    setForm({ monto: '', descripcion: '', categoria: 'Comida', fecha: new Date().toISOString().split('T')[0] });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">FinTrack AI</h1>
        <div className="flex gap-4 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/ingresos" className="hover:text-blue-600">Ingresos</Link>
          <Link href="/gastos" className="text-blue-600">Gastos</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mis Gastos</h2>
            <p className="text-gray-500 text-sm mt-1">
              Total: <span className="text-red-500 font-semibold">
                -${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          <button onClick={openCreate}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + Agregar gasto
          </button>
        </div>

        {/* Filtro por categoría */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['Todas', ...CATEGORIAS].map(c => (
            <button key={c} onClick={() => setFiltroCategoria(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filtroCategoria === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}>
              {CATEGORIA_ICONS[c] || ''} {c}
            </button>
          ))}
        </div>

        {/* Modal / Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editando ? 'Editar gasto' : 'Nuevo gasto'}
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                  <input type="number" name="monto" value={form.monto} onChange={handleChange}
                    required min="0.01" step="0.01" placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange}
                    placeholder="Ej: Almuerzo en restaurante"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors">
                    {editando ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-gray-500">No hay gastos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gastosFiltrados.map(g => (
              <div key={g.id_gasto}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-lg">
                    {CATEGORIA_ICONS[g.categoria] || '📦'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{g.descripcion || 'Sin descripción'}</p>
                    <p className="text-xs text-gray-400">{g.categoria} · {g.fecha?.split('T')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-500 font-bold text-lg">
                    -${parseFloat(g.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(g)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(g.id_gasto)}
                      className="text-red-400 hover:text-red-600 text-sm font-medium">
                      Eliminar
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