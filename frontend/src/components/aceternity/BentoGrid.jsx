export function BentoGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function BentoGridItem({ title, description, icon, className = '' }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-indigo-200 ${className}`}
    >
      <div className="mb-3 text-indigo-500">{icon}</div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="mt-1 text-3xl font-bold text-slate-900">{description}</p>
    </div>
  );
}
