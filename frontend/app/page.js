'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const timeout = setTimeout(() => {
      if (token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }, 400); // pequeño delay para mostrar el loading

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="flex flex-col items-center gap-4">

        {/* Loader */}
        <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={22} />
        </div>

        {/* Texto */}
        <p className="text-sm text-gray-500 font-medium tracking-wide">
          Cargando FinTrack AI...
        </p>

      </div>
    </div>
  );
}