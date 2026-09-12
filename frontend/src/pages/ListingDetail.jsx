import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../api';
import { Skeleton } from '../components/Skeleton';
import {
  CheckBadgeIcon,
  ChevronLeftIcon,
  ImageIcon,
  PhoneIcon,
  PinIcon,
  Spinner,
  TrashIcon,
  WhatsAppIcon,
} from '../components/icons';
import { errorMessage, formatPrice, timeAgo } from '../constants';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_BADGE, FREE_BADGE, conditionBadgeClass, initialOf } from '../ui';

// tel: and wa.me both want digits only.
function digitsOnly(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [mainFailed, setMainFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/listings/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setListing(data);
        setActiveImage(0);
        setMainFailed(false);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, 'Could not load this listing'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleRemove() {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Remove this listing? It will disappear from the feed.')) return;

    setRemoving(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/my-listings');
    } catch (err) {
      setError(errorMessage(err, 'Could not remove this listing'));
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div>
        <BackLink />
        <p role="alert" className="alert-error mt-4">
          {error}
        </p>
      </div>
    );
  }

  if (!listing) return null;

  const gallery = [listing.coverImageUrl, ...listing.images];
  const isOwner = user?.id === listing.seller.id;
  const phoneDigits = digitsOnly(listing.seller.phone);
  const isFree = listing.price === 0;

  return (
    <div>
      <BackLink />

      <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            {mainFailed ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                <ImageIcon className="h-10 w-10" />
                <span className="text-xs font-medium">Image unavailable</span>
              </div>
            ) : (
              <img
                src={gallery[activeImage]}
                alt={`${listing.title}, image ${activeImage + 1} of ${gallery.length}`}
                onError={() => setMainFailed(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    setActiveImage(index);
                    setMainFailed(false);
                  }}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === activeImage}
                  className={
                    index === activeImage
                      ? 'h-16 w-16 overflow-hidden rounded-xl ring-2 ring-brand-500 ring-offset-2 focus-visible:ring-4 focus-visible:ring-brand-700 focus-visible:outline-none'
                      : 'focus-ring h-16 w-16 overflow-hidden rounded-xl border border-slate-200 opacity-60 transition hover:opacity-100'
                  }
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {isFree ? (
              <span className={`badge ${FREE_BADGE} px-3 py-1 text-base font-bold`}>Free</span>
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatPrice(listing.price)}
              </span>
            )}
            {listing.negotiable && (
              <span className="badge bg-accent-100 text-accent-800 ring-1 ring-inset ring-accent-200">
                Negotiable
              </span>
            )}
          </div>

          <h1 className="mt-2 text-xl leading-snug font-bold text-slate-900 sm:text-2xl">
            {listing.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`badge ${conditionBadgeClass(listing.condition)}`}>
              {listing.condition}
            </span>
            <span className={`badge ${CATEGORY_BADGE}`}>{listing.category}</span>
            <span className="text-xs text-slate-500">Posted {timeAgo(listing.createdAt)}</span>
          </div>

          {listing.description && (
            <section className="mt-5 border-t border-slate-200 pt-5">
              <h2 className="section-title">Description</h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-700">
                {listing.description}
              </p>
            </section>
          )}

          <div className="card mt-6 p-4 sm:p-5">
            <h2 className="section-title">Seller</h2>

            <div className="mt-3 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-violet-600 text-base font-bold text-white shadow-sm"
              >
                {initialOf(listing.seller.name)}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                  <span className="truncate">{listing.seller.name}</span>
                  {listing.seller.verified && (
                    <span className="badge bg-green-100 text-green-800 ring-1 ring-inset ring-green-200">
                      <CheckBadgeIcon />
                      Verified
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <PinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{listing.seller.hostel}</span>
                </p>
              </div>
            </div>

            {isOwner ? (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={removing}
                  className="btn btn-danger-quiet w-full"
                >
                  {removing ? <Spinner /> : <TrashIcon />}
                  {removing ? 'Removing…' : 'Remove listing'}
                </button>
                {error && (
                  <p role="alert" className="alert-error mt-3">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                <p className="font-mono text-base font-semibold tracking-wide text-slate-800 tabular-nums">
                  {listing.seller.phone}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${phoneDigits}`} className="btn btn-primary flex-1">
                    <PhoneIcon className="h-4 w-4" />
                    Call seller
                  </a>
                  <a
                    href={`https://wa.me/${phoneDigits}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp flex-1"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
                <p className="note">
                  Deals happen in person. CampusKart does not handle payments or delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="focus-ring inline-flex items-center gap-1.5 rounded-lg py-1 text-sm font-medium text-slate-500 transition hover:text-brand-700"
    >
      <ChevronLeftIcon />
      Back to listings
    </Link>
  );
}
