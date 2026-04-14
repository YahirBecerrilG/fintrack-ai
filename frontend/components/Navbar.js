'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Sparkles,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ingresos',  label: 'Ingresos',  icon: TrendingUp },
  { href: '/gastos',    label: 'Gastos',    icon: TrendingDown },
  { href: '/deudas',    label: 'Deudas',    icon: CreditCard },
  { href: '/asistente', label: 'IA',        icon: Sparkles },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  }

  const usuario = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('usuario') || '{}')
    : {};

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 md:px-6 py-3
      sticky top-0 z-40">

      <div className="flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600
            flex items-center justify-center text-white font-bold shadow-sm">
            $
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">
              FinTrack AI
            </span>
            <span className="text-[10px] text-gray-400 tracking-wide">
              SMART FINANCE
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl">
          {NAV_LINKS.map(link => {
            const activo = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activo
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Usuario + Mobile button */}
        <div className="flex items-center gap-3">

          {/* Usuario desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800">
                {usuario?.nombre || 'Usuario'}
              </p>
              <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
                {usuario?.correo || ''}
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900
              flex items-center justify-center text-white text-sm font-semibold">
              {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600
                bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>

          {/* Botón mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 bg-white border border-gray-100 rounded-xl shadow-sm p-3 space-y-2">

          {NAV_LINKS.map(link => {
            const activo = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                  activo
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}

          {/* Usuario mobile */}
          <div className="border-t pt-3 mt-2">
            <p className="text-xs font-semibold text-gray-800">
              {usuario?.nombre || 'Usuario'}
            </p>
            <p className="text-[10px] text-gray-400 mb-2">
              {usuario?.correo || ''}
            </p>

            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg w-full"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}