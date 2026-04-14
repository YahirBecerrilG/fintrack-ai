export default function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm
      flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4
        animate-fade-in-up">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center
          text-2xl mx-auto mb-4 ${danger ? 'bg-red-50' : 'bg-blue-50'}`}>
          {danger ? '🗑️' : '❓'}
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className={`flex-1 font-semibold py-2.5 rounded-xl text-sm transition-colors text-white
              ${danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'}`}>
            Confirmar
          </button>
          <button onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700
              font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}