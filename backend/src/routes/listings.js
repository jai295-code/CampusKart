const fs = require('fs');
const express = require('express');

const prisma = require('../prisma');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { CATEGORIES, CONDITIONS } = require('../constants');

const router = express.Router();

// Feed and my-listings shape. No phone number: Requirement 5.5.
const FEED_SELLER = { id: true, name: true, hostel: true, verified: true };

// Detail shape. The only place the seller's phone is exposed: Requirement 7.5.
const DETAIL_SELLER = { id: true, name: true, hostel: true, phone: true, verified: true };

// Single exit point for listing data. `images` is stored as a JSON string
// because SQLite has no array type; callers always see a real array.
function serializeListing(listing) {
  let images = [];
  try {
    const parsed = JSON.parse(listing.images || '[]');
    if (Array.isArray(parsed)) images = parsed;
  } catch (err) {
    images = [];
  }
  return { ...listing, images };
}

function trimmed(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isTruthyFlag(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

// Multer has already written to disk by the time the handler validates, so a
// rejected submission has to take its files back out.
function discardUploads(files) {
  if (!files) return;
  for (const list of Object.values(files)) {
    for (const file of list) {
      fs.unlink(file.path, () => {});
    }
  }
}

router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 4 },
  ]),
  async (req, res, next) => {
    try {
      const title = trimmed(req.body.title);
      const description = trimmed(req.body.description);
      const category = trimmed(req.body.category);
      const condition = trimmed(req.body.condition);
      const rawPrice = trimmed(req.body.price);
      const negotiable = isTruthyFlag(req.body.negotiable);

      const cover = req.files && req.files.cover && req.files.cover[0];
      const extras = (req.files && req.files.images) || [];

      const reject = (status, error) => {
        discardUploads(req.files);
        return res.status(status).json({ error });
      };

      // Everything is validated before the database write, so a rejected
      // submission leaves stored listings unchanged.
      if (!title) return reject(400, 'title is required');
      if (!category) return reject(400, 'category is required');
      if (!rawPrice) return reject(400, 'price is required');
      if (!condition) return reject(400, 'condition is required');
      if (!cover) return reject(400, 'A cover image is required');

      if (!CATEGORIES.includes(category)) {
        return reject(400, 'Choose a category from the provided list');
      }
      if (!CONDITIONS.includes(condition)) {
        return reject(400, 'Choose a condition from the provided list');
      }

      const price = Number(rawPrice);
      if (!Number.isInteger(price)) {
        return reject(400, 'Price must be a whole number of rupees');
      }
      // Zero is allowed and means the item is free.
      if (price < 0) {
        return reject(400, 'Price cannot be negative');
      }

      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          category,
          price,
          negotiable,
          condition,
          coverImageUrl: `/uploads/${cover.filename}`,
          images: JSON.stringify(extras.map((file) => `/uploads/${file.filename}`)),
          status: 'active',
          sellerId: req.userId,
        },
        include: { seller: { select: FEED_SELLER } },
      });

      return res.status(201).json(serializeListing(listing));
    } catch (err) {
      discardUploads(req.files);
      return next(err);
    }
  }
);

// GET / — the public feed with keyword search and filters.
router.get('/', async (req, res, next) => {
  try {
    const { q, category, condition, minPrice, maxPrice } = req.query;

    // One `where` object, so a keyword plus any combination of filters ANDs
    // together and filters alone work without a keyword.
    const where = { status: 'active' };

    const keyword = trimmed(q);
    if (keyword) {
      // On SQLite, Prisma's `contains` compiles to LIKE, which is already
      // case-insensitive for ASCII. Postgres would need mode: 'insensitive'.
      where.OR = [{ title: { contains: keyword } }, { description: { contains: keyword } }];
    }

    const cat = trimmed(category);
    if (cat) where.category = cat;

    const cond = trimmed(condition);
    if (cond) where.condition = cond;

    // Unparseable numbers are ignored rather than treated as an error, so a
    // stray query string cannot break the feed.
    const min = Number(minPrice);
    if (trimmed(minPrice) !== '' && !Number.isNaN(min)) {
      where.price = { ...where.price, gte: min };
    }
    const max = Number(maxPrice);
    if (trimmed(maxPrice) !== '' && !Number.isNaN(max)) {
      where.price = { ...where.price, lte: max };
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: FEED_SELLER } },
    });

    return res.json(listings.map(serializeListing));
  } catch (err) {
    return next(err);
  }
});

// GET /mine — must stay above GET /:id or Express matches "mine" as an id.
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: FEED_SELLER } },
    });
    return res.json(listings.map(serializeListing));
  } catch (err) {
    return next(err);
  }
});

// GET /:id — listing detail. Increments the view count in the same statement
// that reads the row, and is the only route that returns the seller's phone.
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  try {
    const listing = await prisma.listing.update({
      // A removed listing has left the marketplace, so its detail page is a 404
      // too. Filtering here also keeps views from counting up on removed rows.
      where: { id, status: 'active' },
      data: { views: { increment: 1 } },
      include: { seller: { select: DETAIL_SELLER } },
    });
    return res.json(serializeListing(listing));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Listing not found' });
    }
    return next(err);
  }
});

// DELETE /:id — soft delete. The row stays, so a mistaken removal is
// recoverable and the uploaded images are not orphaned.
router.delete('/:id', requireAuth, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  try {
    // Read before writing: a 403 must not have side effects.
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.status === 'removed') {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.sellerId !== req.userId) {
      return res.status(403).json({ error: 'You can only remove your own listings' });
    }

    await prisma.listing.update({ where: { id }, data: { status: 'removed' } });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
