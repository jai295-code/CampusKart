require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const app = express();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// A fresh clone has no uploads/ directory (it is git-ignored), so create it on
// boot rather than failing on the first upload.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json());

// Images are read straight off disk by <img src="/uploads/...">.
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));

// Unknown API path -> JSON 404, never an HTML error page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Single JSON error handler. Multer surfaces upload problems here, and without
// this they would reach the client as an HTML stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Each image must be 5 MB or smaller' });
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res
        .status(400)
        .json({ error: 'At most one cover image and four additional images are allowed' });
    }
    return res.status(400).json({ error: err.message });
  }

  // The fileFilter rejection is a plain Error carrying this flag.
  if (err && err.isImageTypeError) {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;

// Skip listen when the module is required by a script (e.g. a smoke check).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CampusKart API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
