export default function StatCard({ label, value, sub, icon, color, delay = '' }) {
  const colors = {
    green:  { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-600'  },
    red:    { border: 'border-red-400',    bg: 'bg-red-50',    text: 'text-red-500'    },
    blue:   { border: 'border-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-600'   },
    purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    orange: { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-500' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border-l-4
      ${c.border} card-hover animate-fade-in-up ${delay}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-gray-800 mt-1.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}