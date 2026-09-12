// Client-side copy of the fixed value sets, so the UI cannot offer a value the
// API would reject. The backend keeps its own copy and does the enforcing.

export const CATEGORIES = [
  'Books & Notes',
  'Electronics & Gadgets',
  'Stationery',
  'Room & Furniture',
  'Cycles',
  'Others',
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export const MAX_ADDITIONAL_IMAGES = 4;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "just now", "5m ago", "3h ago", "2d ago"
export function timeAgo(date) {
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return '';

  const elapsed = Date.now() - then;
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  return `${Math.floor(elapsed / DAY)}d ago`;
}

// Whole rupees, grouped for readability. Zero reads as "Free".
export function formatPrice(price) {
  if (price === 0) return 'Free';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

// Pull the API's error message out of an axios failure, with a fallback.
export function errorMessage(err, fallback = 'Something went wrong, please try again') {
  return err?.response?.data?.error || fallback;
}
