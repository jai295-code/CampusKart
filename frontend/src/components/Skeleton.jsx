// Loading placeholders shaped like the real content, so nothing jumps when the
// data lands. Decorative, so they stay out of the accessibility tree; the
// surrounding live region is what announces the result.

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

// Mirrors ListingCard: square cover, price row, two title lines, meta line.
export function SkeletonCard() {
  return (
    <div aria-hidden="true" className="card w-full overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// Mirrors a MyListings row: thumbnail, two lines of text, an action.
export function SkeletonRow() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
      <Skeleton className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}
