import clsx from 'clsx';

export default function StatCard({ label, value, sub, icon: Icon, color = 'green', delay = '' }) {

  const colors = {
    green:  { bg: 'bg-green-600',    soft: 'bg-green-50',    text: 'text-green-600' },
    red:    { bg: 'bg-red-500',      soft: 'bg-red-50',      text: 'text-red-500' },
    blue:   { bg: 'bg-blue-600',     soft: 'bg-blue-50',     text: 'text-blue-600' },
    purple: { bg: 'bg-indigo-500',   soft: 'bg-indigo-50',   text: 'text-indigo-500' },
    orange: { bg: 'bg-orange-500',   soft: 'bg-orange-50',   text: 'text-orange-500' },
    gray:   { bg: 'bg-gray-700',     soft: 'bg-gray-100',    text: 'text-gray-600' },
  };

  const c = colors[color] || colors.green;

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-gray-100 p-5",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "flex flex-col justify-between",
        "animate-fade-in-up",
        delay
      )}
    >
      <div className="flex justify-between items-start">

        {/* Texto */}
        <div className="flex-1">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1.5">
            {value}
          </p>

          {sub && (
            <p className="text-xs text-gray-400 mt-1">
              {sub}
            </p>
          )}
        </div>

        {/* Icono */}
        <div className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
          c.bg
        )}>
          {Icon && <Icon size={18} className="text-white" />}
        </div>
      </div>
    </div>
  );
}