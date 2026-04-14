import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <p className="text-8xl mb-6">🧾</p>
        <h1 className="text-4xl font-black text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-8">Esta página no existe en tu balance.</p>
        <Link href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white
            px-6 py-3 rounded-xl font-bold transition-colors">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}