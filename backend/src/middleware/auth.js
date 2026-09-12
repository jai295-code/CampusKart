const jwt = require('jsonwebtoken');

// Attached to write routes plus GET /api/auth/me and GET /api/listings/mine.
// The feed and detail routes stay public.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid, please log in again' });
  }
}

module.exports = { requireAuth };
