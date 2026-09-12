import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api';
import EmptyState from '../components/EmptyState';
import { SkeletonRow } from '../components/Skeleton';
import { CartIcon, PlusIcon, Spinner, TrashIcon } from '../components/icons';
import { errorMessage, formatPrice, timeAgo } from '../constants';
import { FREE_BADGE, conditionBadgeClass } from '../ui';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/listings/mine');
      setListings(data);
    } catch (err) {
      setError(errorMessage(err, 'Could not load your listings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(listing) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Remove "${listing.title}"? It will disappear from the feed.`)) return;

    setRemovingId(listing.id);
    setError('');
    try {
      await api.delete(`/listings/${listing.id}`);
      // Refetch so the row disappears from a server-confirmed list.
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not remove that listing'));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        My listings
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">Your active items. Remove anything that sold.</p>

      {error && (
        <p role="alert" className="alert-error mt-4">
          {error}
        </p>
      )}

      {loading && (
        <ul className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="card">
              <SkeletonRow />
            </li>
          ))}
        </ul>
      )}

      {!loading && listings.length === 0 && !error && (
        <EmptyState
          className="mt-6"
          icon={<CartIcon className="h-6 w-6" />}
          title="You have no active listings"
          description="Post the textbook, calculator or cycle you are done with and buyers will reach you directly."
          action={
            <Link to="/post" className="btn btn-primary">
              <PlusIcon className="h-4 w-4" />
              Post your first item
            </Link>
          }
        />
      )}

      {!loading && listings.length > 0 && (
        <ul className="mt-6 space-y-3">
          {listings.map((listing) => {
            const isFree = listing.price === 0;
            const isRemoving = removingId === listing.id;

            return (
              <li
                key={listing.id}
                className="card flex flex-wrap items-center gap-3 p-3 transition duration-200 hover:border-brand-200 hover:shadow-md hover:shadow-brand-900/5 sm:gap-4 sm:p-4"
              >
                <Link to={`/listing/${listing.id}`} className="focus-ring shrink-0 rounded-xl">
                  <img
                    src={listing.coverImageUrl}
                    alt={listing.title}
                    className="h-16 w-16 rounded-xl border border-slate-200 object-cover sm:h-20 sm:w-20"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/listing/${listing.id}`}
                    className="focus-ring block truncate rounded-sm font-semibold text-slate-900 transition hover:text-brand-700"
                  >
                    {listing.title}
                  </Link>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {isFree ? (
                      <span className={`badge ${FREE_BADGE}`}>Free</span>
                    ) : (
                      <span className="badge bg-slate-900 text-white">
                        {formatPrice(listing.price)}
                      </span>
                    )}
                    <span className={`badge ${conditionBadgeClass(listing.condition)}`}>
                      {listing.condition}
                    </span>
                    <span className="text-xs text-slate-500">{timeAgo(listing.createdAt)}</span>
                    {listing.views != null && (
                      <span className="text-xs text-slate-400">
                        · {listing.views} {listing.views === 1 ? 'view' : 'views'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(listing)}
                  disabled={isRemoving}
                  className="btn btn-danger-quiet btn-sm ml-auto"
                >
                  {isRemoving ? <Spinner className="h-3.5 w-3.5" /> : <TrashIcon className="h-3.5 w-3.5" />}
                  {isRemoving ? 'Removing…' : 'Remove'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
