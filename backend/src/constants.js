// Server-side copy of the fixed value sets. The frontend keeps its own copy for
// building selects; this one is the enforcement point.

const CATEGORIES = [
  'Books & Notes',
  'Electronics & Gadgets',
  'Stationery',
  'Room & Furniture',
  'Cycles',
  'Others',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const STATUSES = ['active', 'removed'];

// Per-image upload cap, in bytes.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Cover image plus up to four extras.
const MAX_ADDITIONAL_IMAGES = 4;

module.exports = {
  CATEGORIES,
  CONDITIONS,
  STATUSES,
  MAX_IMAGE_SIZE,
  MAX_ADDITIONAL_IMAGES,
};
