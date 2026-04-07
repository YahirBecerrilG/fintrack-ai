'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';

const CATEGORIAS = ['General', 'Salario', 'Freelance', 'Negocio', 'Inversiones', 'Otros'];

export default function IngresosPage() {
  const router = useRouter();
  const [ingresos, setIngresos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    monto: '', descripcion: '', categoria: 'General',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchIngresos();
  }, []);

  async function fetchIngresos() {
    try {
      const res = await api.get('/api/ingresos');
      setIngresos(res.data.ingresos);
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
    setForm({ monto: '', descripcion: '', categoria: 'General', fecha: new Date().toISOString().split('T')[0] });
    setError('');
    setShowForm(true);
  }

  function openEdit(ingreso) {
    setEditando(ingreso.id_ingreso);
    setForm({
      monto: ingreso.monto,
      descripcion: ingreso.descripcion || '',
      categoria: ingreso.categoria,
      fecha: ingreso.fecha?.split('T')[0] || ''
    });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editando) {
        await api.put(`/api/ingresos/${editando}`, form);
      } else {
        await api.post('/api/ingresos', form);
      }
      setShowForm(false);
      fetchIngresos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este ingreso?')) return;
    try {
      await api.delete(`/api/ingresos/${id}`);
      fetchIngresos();
    } catch (err) {
      console.error(err);
    }
  }

  const total = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">FinTrack AI</h1>
        <div className="flex gap-4 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/ingresos" className="text-blue-600">Ingresos</Link>
          <Link href="/gastos" className="hover:text-blue-600">Gastos</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mis Ingresos</h2>
            <p className="text-gray-500 text-sm mt-1">
              Total: <span className="text-green-600 font-semibold">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          <button onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + Agregar ingreso
          </button>
        </div>

        {/* Modal / Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editando ? 'Editar ingreso' : 'Nuevo ingreso'}
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange}
                    placeholder="Ej: Pago de nómina"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
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
        ) : ingresos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-gray-500">Aún no tienes ingresos registrados.</p>
            <button onClick={openCreate}
              className="mt-4 text-green-600 font-medium hover:underline text-sm">
              Agrega tu primer ingreso
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ingresos.map(i => (
              <div key={i.id_ingreso}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
                    💵
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{i.descripcion || 'Sin descripción'}</p>
                    <p className="text-xs text-gray-400">{i.categoria} · {i.fecha?.split('T')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-bold text-lg">
                    +${parseFloat(i.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(i)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(i.id_ingreso)}
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