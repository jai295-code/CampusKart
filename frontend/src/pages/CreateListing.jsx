import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api';
import { ImageIcon, Spinner, TrashIcon } from '../components/icons';
import { CATEGORIES, CONDITIONS, MAX_ADDITIONAL_IMAGES, errorMessage } from '../constants';

export default function CreateListing() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [description, setDescription] = useState('');

  const [cover, setCover] = useState(null);
  const [extras, setExtras] = useState([]);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clearing a selection has to reset the input too, otherwise re-picking the
  // same file fires no change event and the preview never comes back.
  const coverInput = useRef(null);
  const extrasInput = useRef(null);

  const coverPreview = usePreviews(cover ? [cover] : [])[0];
  const extraPreviews = usePreviews(extras);

  function handleExtras(event) {
    const files = Array.from(event.target.files || []);
    if (files.length > MAX_ADDITIONAL_IMAGES) {
      setError(`You can add at most ${MAX_ADDITIONAL_IMAGES} additional images`);
      setExtras(files.slice(0, MAX_ADDITIONAL_IMAGES));
      return;
    }
    setError('');
    setExtras(files);
  }

  function clearCover() {
    setCover(null);
    if (coverInput.current) coverInput.current.value = '';
  }

  function removeExtra(index) {
    setExtras((prev) => prev.filter((_, i) => i !== index));
    if (extrasInput.current) extrasInput.current.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('category', category);
      form.append('price', price);
      form.append('negotiable', String(negotiable));
      form.append('condition', condition);
      if (cover) form.append('cover', cover);
      extras.forEach((file) => form.append('images', file));

      // No Content-Type header on purpose: the browser has to generate the
      // multipart boundary. Setting it by hand silently breaks the upload.
      const { data } = await api.post('/listings', form);
      navigate(`/listing/${data.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Could not post your listing'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Post an item
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Add clear photos and an honest description. Buyers contact you directly.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 overflow-hidden" noValidate>
        {/* Photos ------------------------------------------------------------ */}
        <section className="p-4 sm:p-6">
          <h2 className="section-title">Photos</h2>

          {/* The real inputs stay mounted and sr-only inside their label, so they
              remain keyboard reachable and keep their accessible name. */}
          <div className="relative mt-3">
            <label
              htmlFor="cover"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-4 text-center transition hover:border-brand-400 hover:bg-brand-50/50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="aspect-square w-full max-w-64 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <span className="mt-4 text-brand-500">
                  <ImageIcon className="h-8 w-8" />
                </span>
              )}
              <span className="text-sm font-semibold text-slate-800">
                Cover image (required)
              </span>
              <span className="mb-2 text-xs text-slate-500">
                {coverPreview
                  ? 'Tap to choose a different photo'
                  : 'This is the photo buyers see on the feed'}
              </span>
              <input
                ref={coverInput}
                id="cover"
                type="file"
                accept="image/*"
                onChange={(event) => setCover(event.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>

            {coverPreview && (
              <button
                type="button"
                onClick={clearCover}
                aria-label="Remove cover image"
                className="focus-ring absolute top-3 right-3 rounded-lg bg-white/90 p-1.5 text-red-600 shadow-sm transition hover:bg-white hover:text-red-700"
              >
                <TrashIcon />
              </button>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="images"
              className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 transition hover:border-brand-400 hover:bg-brand-50/50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200"
            >
              <span className="text-brand-500">
                <ImageIcon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  Additional images (up to {MAX_ADDITIONAL_IMAGES}, optional)
                </span>
                <span className="block text-xs text-slate-500">
                  More angles, labels or defects help buyers decide
                </span>
              </span>
              <span className="badge bg-white text-slate-600 ring-1 ring-inset ring-slate-200">
                {extras.length} / {MAX_ADDITIONAL_IMAGES} added
              </span>
              <input
                ref={extrasInput}
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtras}
                className="sr-only"
              />
            </label>

            {extraPreviews.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {extraPreviews.map((src, index) => (
                  <li
                    key={src}
                    className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={src}
                      alt={`Additional preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtra(index)}
                      aria-label={`Remove additional image ${index + 1}`}
                      className="focus-ring absolute top-1 right-1 rounded-md bg-white/90 p-1 text-red-600 shadow-sm transition hover:bg-white hover:text-red-700"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 text-xs text-slate-500">
              Each image must be an image file under 5 MB.
            </p>
          </div>
        </section>

        {/* Item details ------------------------------------------------------ */}
        <section className="border-t border-slate-200 p-4 sm:p-6">
          <h2 className="section-title">Item details</h2>

          <div className="mt-3">
            <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Casio FX-991EX scientific calculator"
              className="field"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field field-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                Condition
              </label>
              <select
                id="condition"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="field field-select"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Pricing ----------------------------------------------------------- */}
        <section className="border-t border-slate-200 p-4 sm:p-6">
          <h2 className="section-title">Pricing</h2>

          <div className="mt-3">
            <label htmlFor="price" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Price (₹)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0 for a free item"
              className="field sm:max-w-48"
            />
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(event) => setNegotiable(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            />
            Price is negotiable
          </label>
        </section>

        {/* Description ------------------------------------------------------- */}
        <section className="border-t border-slate-200 p-4 sm:p-6">
          <h2 className="section-title">Description</h2>

          <div className="mt-3">
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Tell buyers about it
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="How old is it? Is everything working? Why are you selling?"
              className="field resize-y"
            />
          </div>
        </section>

        {/* Submit ------------------------------------------------------------ */}
        <div className="space-y-3 border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6">
          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-gradient w-full py-3">
            {submitting && <Spinner />}
            {submitting ? 'Posting…' : 'Post listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Object URLs have to be revoked, otherwise every re-pick leaks a blob.
function usePreviews(files) {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join('|')]);

  return urls;
}
