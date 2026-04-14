export default function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-14 text-center animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">{description}</p>
      {action && (
        <button onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white
            px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}