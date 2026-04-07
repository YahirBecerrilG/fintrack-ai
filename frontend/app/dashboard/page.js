'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    if (!token) { router.push('/login'); return; }
    setUsuario(JSON.parse(user));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">FinTrack AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hola, {usuario?.nombre}</span>
          <button onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium">
            Cerrar sesión
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Bienvenido a FinTrack AI 🎉
          </h2>
          <p className="text-gray-500">
            Sprint 1 completado — Dashboard en construcción (Sprint 3)
          </p>
        </div>
      </main>
    </div>
  );
}