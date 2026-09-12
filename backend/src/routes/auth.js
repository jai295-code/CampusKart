const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const TOKEN_TTL = '7d';
const BCRYPT_ROUNDS = 10;

// Deliberately simple: one @, something either side, a dot in the domain.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The single exit point for user data. passwordHash must never leave here.
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    hostel: user.hostel,
    phone: user.phone,
    verified: user.verified,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function trimmed(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.post('/signup', async (req, res, next) => {
  try {
    const name = trimmed(req.body.name);
    const email = trimmed(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const hostel = trimmed(req.body.hostel);
    const phone = trimmed(req.body.phone);
    const avatarUrl = trimmed(req.body.avatarUrl) || null;

    // All validation happens before the write, so a rejected signup stores nothing.
    const required = { name, email, password, hostel, phone };
    for (const [field, value] of Object.entries(required)) {
      if (!value) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'That email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, hostel, phone, passwordHash, verified: true, avatarUrl },
    });

    return res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    // The unique index is the real guarantee against a duplicate-signup race.
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'That email is already registered' });
    }
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = trimmed(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Same message for an unknown email and a wrong password, so this endpoint
    // is not an account-existence oracle.
    const invalid = { error: 'Invalid email or password' };
    if (!user) {
      return res.status(401).json(invalid);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json(invalid);
    }

    return res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid, please log in again' });
    }
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
