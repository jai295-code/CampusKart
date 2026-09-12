// The one empty-state treatment used by the feed, my-listings, and the
// catch-all route: an icon, a headline, a sentence that says what to do next,
// and an optional call to action.

export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center ${className}`}
    >
      {icon && (
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
          {icon}
        </span>
      )}
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
