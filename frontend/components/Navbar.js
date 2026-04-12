'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/ingresos',  label: 'Ingresos',  icon: '💰' },
  { href: '/gastos',    label: 'Gastos',    icon: '💸' },
  { href: '/deudas',    label: 'Deudas',    icon: '🧾' },
  { href: '/asistente', label: 'IA',        icon: '✨' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  }

  const usuario = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('usuario') || '{}')
    : {};

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3.5
      flex justify-between items-center shadow-sm sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-black gradient-text">FinTrack AI</span>
        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold
          px-1.5 py-0.5 rounded-full tracking-wide">
          BETA
        </span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(link => {
          const activo = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-150
                ${activo
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}>
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-xs font-semibold text-gray-700">{usuario?.nombre || 'Usuario'}</p>
          <p className="text-[10px] text-gray-400">{usuario?.correo || ''}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
          flex items-center justify-center text-white text-sm font-bold">
          {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
        </div>
        <button onClick={logout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors
            bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium">
          Salir
        </button>
      </div>
    </nav>
  );
}