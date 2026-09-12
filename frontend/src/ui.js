// Presentation-only helpers. Nothing here touches the API, routing, or state
// shape; it exists so the pages agree on how a condition badge or an avatar
// initial should look. Data constants stay in constants.js.

// One glyph per category, matching the fixed CATEGORIES set.
export const CATEGORY_EMOJI = {
  'Books & Notes': '📚',
  'Electronics & Gadgets': '🎧',
  Stationery: '✏️',
  'Room & Furniture': '🪑',
  Cycles: '🚲',
  Others: '📦',
};

// Cooler and positive for the best condition, neutral in the middle, warmer at
// the bottom. Green is left alone: it belongs to WhatsApp and to "Free".
const CONDITION_BADGE = {
  New: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  'Like New': 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
  Good: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  Fair: 'bg-accent-100 text-accent-800 ring-1 ring-inset ring-accent-200',
};

export function conditionBadgeClass(condition) {
  return CONDITION_BADGE[condition] || CONDITION_BADGE.Good;
}

export const CATEGORY_BADGE = 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100';

export const FREE_BADGE = 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200';

// "Ananya Sharma" -> "A". Falls back to a neutral glyph for an empty name.
export function initialOf(name) {
  const match = String(name || '').match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : '·';
}

// "Ananya Sharma" -> "Ananya"
export function firstNameOf(name) {
  return String(name || '').trim().split(/\s+/)[0] || '';
}
