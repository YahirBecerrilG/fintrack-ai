'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router  = useRouter();
  const [usuario,  setUsuario]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('usuario');

    if (!token) {
      router.push('/login');
      return;
    }

    // Verificar expiración del token (decode básico)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.push('/login');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    setUsuario(JSON.parse(user || '{}'));
    setLoading(false);
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  }

  return { usuario, loading, logout };
}