export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent
            rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}