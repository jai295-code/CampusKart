const path = require('path');
const multer = require('multer');

const { MAX_IMAGE_SIZE } = require('../constants');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Timestamp + random suffix keeps two simultaneous uploads of "photo.jpg"
    // from overwriting each other.
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${suffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    const err = new Error('Only image files are allowed');
    // Flag the error so the central handler can map it to 400.
    err.isImageTypeError = true;
    return cb(err);
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});

module.exports = upload;
