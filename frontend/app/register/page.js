'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirm: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔹 Validación email
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);

  // 🔹 Validación password
  const reglasPassword = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  };

  const passwordFuerte = Object.values(reglasPassword).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailValido) {
      return setError('Correo electrónico no válido');
    }

    if (!passwordFuerte) {
      return setError('La contraseña no cumple con los requisitos');
    }

    if (form.password !== form.confirm) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          nombre: form.nombre,
          correo: form.correo,
          password: form.password
        }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      router.push('/dashboard');

    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center
      bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">

      {/* Fondo decorativo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />

      {/* Card */}
      <div className={`relative bg-white/80 backdrop-blur-xl border border-gray-200
        rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4
        ${shake ? 'animate-[shake_0.4s]' : ''}`}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl
            bg-gradient-to-br from-blue-600 to-purple-600
            flex items-center justify-center text-white text-xl font-bold shadow-lg">
            $
          </div>
          <h1 className="text-2xl font-black text-gray-800">
            Crear cuenta
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Empieza a controlar tus finanzas 🚀
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
            rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Juan Pérez"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
              placeholder="tu@correo.com"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2
                ${form.correo
                  ? emailValido
                    ? 'border-green-300 focus:ring-green-400'
                    : 'border-red-300 focus:ring-red-400'
                  : 'border-gray-200 focus:ring-blue-500'
                }`}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Crea una contraseña segura"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Reglas */}
            <div className="mt-2 text-xs space-y-1">
              {[
                { ok: reglasPassword.length, text: 'Mínimo 8 caracteres' },
                { ok: reglasPassword.upper, text: 'Una mayúscula' },
                { ok: reglasPassword.lower, text: 'Una minúscula' },
                { ok: reglasPassword.number, text: 'Un número' },
              ].map((r, i) => (
                <p key={i} className={r.ok ? 'text-green-600' : 'text-gray-400'}>
                  {r.ok ? '✓' : '•'} {r.text}
                </p>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2
                ${form.confirm
                  ? form.password === form.confirm
                    ? 'border-green-300 focus:ring-green-400'
                    : 'border-red-300 focus:ring-red-400'
                  : 'border-gray-200 focus:ring-blue-500'
                }`}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600
              hover:from-blue-700 hover:to-purple-700
              disabled:from-gray-400 disabled:to-gray-400
              text-white font-bold py-2.5 rounded-xl
              transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login"
            className="text-blue-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>

      {/* Animación shake */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}