import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api';
import EmptyState from '../components/EmptyState';
import ListingCard from '../components/ListingCard';
import { SkeletonCard } from '../components/Skeleton';
import { PlusIcon, SearchIcon, TagIcon } from '../components/icons';
import { CATEGORIES, CONDITIONS, errorMessage } from '../constants';
import { CATEGORY_EMOJI } from '../ui';

const ALL = '';

export default function Home() {
  const [search, setSearch] = useState('');
  // The debounced copy of `search` is what actually drives the request.
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [condition, setCondition] = useState(ALL);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // Only non-empty values are sent, so an untouched control adds no filter.
    const params = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (condition) params.condition = condition;
    if (minPrice !== '') params.minPrice = minPrice;
    if (maxPrice !== '') params.maxPrice = maxPrice;

    api
      .get('/listings', { params })
      .then(({ data }) => {
        if (!cancelled) setListings(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, 'Could not load listings'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, category, condition, minPrice, maxPrice]);

  const filtersActive =
    search !== '' || category !== ALL || condition !== ALL || minPrice !== '' || maxPrice !== '';

  function clearAll() {
    setSearch('');
    setCategory(ALL);
    setCondition(ALL);
    setMinPrice('');
    setMaxPrice('');
  }

  const chips = [{ label: 'All', emoji: '✨', value: ALL }].concat(
    CATEGORIES.map((c) => ({ label: c, emoji: CATEGORY_EMOJI[c], value: c }))
  );

  return (
    <div>
      {/* Hero band. The search field is the focal point. */}
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 via-brand-600 to-violet-600 px-5 py-8 shadow-lg shadow-brand-900/10 sm:px-8 sm:py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Everything on sale in your campus
        </h1>
        <p className="mt-2 max-w-xl text-sm text-brand-100 sm:text-base">
          Buy and sell books, gadgets, cycles and hostel furniture with students down the corridor.
          Newest listings first.
        </p>

        <div className="mt-6">
          <label htmlFor="search" className="sr-only">
            Search listings
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or description"
              className="w-full rounded-2xl border-0 bg-white py-3.5 pr-4 pl-12 text-sm text-slate-900 shadow-xl shadow-brand-950/20 transition placeholder:text-slate-400 focus:ring-4 focus:ring-white/40 focus:outline-none sm:text-base"
            />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <div className="-mx-4 mt-6 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:overflow-visible sm:px-0">
        <div
          className="flex w-max gap-2 sm:w-auto sm:flex-wrap"
          role="group"
          aria-label="Filter by category"
        >
          {chips.map((chip) => {
            const active = category === chip.value;
            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(chip.value)}
                className={active ? 'chip chip-active' : 'chip'}
              >
                <span aria-hidden="true">{chip.emoji}</span>
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition and price, aligned on one bar */}
      <div className="card mt-4 flex flex-wrap items-end gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="condition" className="mb-1 block text-xs font-semibold text-slate-600">
            Condition
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="field field-select sm:w-40"
          >
            <option value={ALL}>Any</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 flex-1 sm:flex-none">
          <label htmlFor="minPrice" className="mb-1 block text-xs font-semibold text-slate-600">
            Min price
          </label>
          <input
            id="minPrice"
            type="number"
            min="0"
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="0"
            className="field sm:w-28"
          />
        </div>

        <div className="min-w-0 flex-1 sm:flex-none">
          <label htmlFor="maxPrice" className="mb-1 block text-xs font-semibold text-slate-600">
            Max price
          </label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Any"
            className="field sm:w-28"
          />
        </div>
      </div>

      <div className="mt-6">
        {/* The count sits in its own live region; the reset control stays out of
            one so it is not announced every time the results change. */}
        {!error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p aria-live="polite" className="text-sm font-semibold text-slate-700">
              {loading
                ? 'Loading…'
                : `${listings.length} ${listings.length === 1 ? 'item' : 'items'}`}
            </p>
            {filtersActive && (
              <button type="button" onClick={clearAll} className="chip">
                Clear all
              </button>
            )}
          </div>
        )}

        <div aria-live="polite">
          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}

          {loading && !error && (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <li key={index} className="flex">
                  <SkeletonCard />
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && listings.length === 0 && (
            <EmptyState
              icon={<TagIcon className="h-6 w-6" />}
              title="Nothing matches those filters yet"
              description="Try a shorter keyword or widen the price range. Or be the first to list something like it."
              action={
                <Link to="/post" className="btn btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  Post an item
                </Link>
              }
            />
          )}

          {!loading && !error && listings.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {listings.map((listing) => (
                <li key={listing.id} className="flex">
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
