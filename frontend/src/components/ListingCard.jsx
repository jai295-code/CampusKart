import { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatPrice, timeAgo } from '../constants';
import { FREE_BADGE, conditionBadgeClass } from '../ui';
import { ImageIcon, PinIcon } from './icons';

// Cover image, price, condition badge, title, seller's hostel, elapsed time.
// The seller's phone number never appears here (Requirement 5.5).
export default function ListingCard({ listing }) {
  // A broken upload should not leave a torn image icon in the grid.
  const [coverFailed, setCoverFailed] = useState(false);
  const isFree = listing.price === 0;

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group focus-ring flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {coverFailed ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-100 text-slate-400">
            <ImageIcon className="h-7 w-7" />
            <span className="text-[10px] font-medium">No image</span>
          </div>
        ) : (
          <img
            src={listing.coverImageUrl}
            alt={listing.title}
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
          />
        )}

        {listing.negotiable && (
          <span className="badge absolute top-2 left-2 bg-white/90 text-[10px] text-slate-700 shadow-sm backdrop-blur-sm">
            Negotiable
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          {isFree ? (
            <span className={`badge ${FREE_BADGE} text-sm font-bold`}>Free</span>
          ) : (
            <span className="text-lg leading-none font-extrabold tracking-tight text-slate-900">
              {formatPrice(listing.price)}
            </span>
          )}
          <span className={`badge shrink-0 ${conditionBadgeClass(listing.condition)}`}>
            {listing.condition}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-slate-800 transition group-hover:text-brand-700">
          {listing.title}
        </h3>

        <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-slate-500">
          <PinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{listing.seller?.hostel}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="shrink-0">{timeAgo(listing.createdAt)}</span>
        </p>
      </div>
    </Link>
  );
}
