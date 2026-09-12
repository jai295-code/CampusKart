# CampusKart

A campus-only marketplace for buying and selling used items within a single college:
textbooks, calculators, electronics, furniture, cycles. It replaces the WhatsApp-group
"broadcast and forget" stream with persistent, searchable, filterable listings.

CampusKart handles discovery and connecting a buyer with a seller. Deals are completed offline
and in person. There are no payments, no delivery, and no escrow.

## Stack

| Part | Tech |
| --- | --- |
| `backend/` | Node.js, Express, Prisma, SQLite, JWT, bcrypt, multer |
| `frontend/` | React, Vite, Tailwind CSS v4, React Router, axios |

The Vite dev server proxies `/api` and `/uploads` to the API, so the browser only ever talks to
`localhost:5173` and CORS never enters the picture.

## Prerequisites

- Node 18 or newer (built and verified on Node 18.20.2)
- npm

## Setup

Two terminals, one per part.

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

The API listens on <http://localhost:4000>. Confirm it with:

```bash
curl localhost:4000/api/health     # -> {"status":"ok"}
```

`backend/.env` is created for you with working local defaults:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=4000
```

**Change `JWT_SECRET` before running this anywhere other than your own laptop.** A shipped
default signing secret means anyone can mint a valid token for any account.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Both servers need to be running: the SPA reads the API through
the proxy.

To check the production build:

```bash
cd frontend
npm run build
```

## API

Errors always come back as `{ "error": "message" }`.

| Method & path | Auth | Purpose |
| --- | --- | --- |
| `GET /api/health` | no | Liveness check |
| `POST /api/auth/signup` | no | Create an account, returns `{ token, user }` |
| `POST /api/auth/login` | no | Log in, returns `{ token, user }` |
| `GET /api/auth/me` | yes | Restore the current session |
| `GET /api/listings` | no | Feed. Accepts `q`, `category`, `condition`, `minPrice`, `maxPrice` |
| `GET /api/listings/mine` | yes | The caller's active listings |
| `POST /api/listings` | yes | Create a listing (multipart: `cover` plus up to 4 `images`) |
| `GET /api/listings/:id` | no | Listing detail. The only response carrying the seller's phone |
| `DELETE /api/listings/:id` | yes, owner | Soft delete, sets `status = "removed"` |

Fixed value sets, enforced server-side:

- Categories: Books & Notes, Electronics & Gadgets, Stationery, Room & Furniture, Cycles, Others
- Conditions: New, Like New, Good, Fair

## Project layout

```
backend/
  prisma/schema.prisma      User and Listing models
  uploads/                  multer destination, served at /uploads, git-ignored
  src/index.js              app wiring, static files, error handler
  src/middleware/auth.js    requireAuth (JWT)
  src/middleware/upload.js  multer storage, image filter, 5 MB cap
  src/routes/auth.js        signup, login, me
  src/routes/listings.js    create, feed, mine, detail, remove
frontend/
  src/api.js                axios instance, attaches the bearer token
  src/constants.js          shared value sets, timeAgo, price formatting
  src/context/              AuthContext
  src/components/           Navbar, ListingCard, ProtectedRoute
  src/pages/                Home, Login, Signup, CreateListing, ListingDetail, MyListings
```

## Known limitations

- **Sign-up is open to anyone.** The planned trust mechanism, a college-provided allowlist of
  approved emails and mobile numbers, is not built yet.
- **`verified` defaults to `true`.** The badge renders for every account, so it is not an
  independent identity check. It exists so the UI is complete for the demo.
- **Phone numbers need a country code.** `wa.me` links only resolve with the full international
  number, for example `+919876543210`.
- **Extra images are stored as a JSON string** because SQLite has no array type. Every read path
  parses it back into an array before it reaches a client.
- **The session token lives in `localStorage`**, which any injected script can read. An
  `httpOnly` cookie is the hardening step for a real deployment.
- **Images are stored on local disk** under `backend/uploads/`. There is no object storage, no
  CDN, and no image resizing.
- **No pagination.** The feed returns every active listing, which is fine at single-college
  scale and would need a cursor at real volume.
- **No automated test suite.** Verification for this release is manual, following the steps in
  the spec's task checkpoints.
- **`react-router-dom` is pinned to 6.x** to stay compatible with Node 18. Two moderate
  advisories against 6.x are open (an open-redirect in `<Link>`/`useNavigate` for
  externally-supplied URLs, and an SSR-hydration issue that does not apply to this SPA). Neither
  is reachable here since every navigation target is a fixed internal path. Moving to Node 20+
  and `react-router-dom` 7 clears both.
- **Tailwind is pinned to 4.0.0** via `overrides` in `frontend/package.json`. Later 4.x releases
  ship a native binary that requires Node 20, and npm silently skips it on Node 18, which
  produces a "Cannot find native binding" build failure. Remove the `overrides` block once you
  are on Node 20+.

Out of scope for this release: wanted posts, favorites, notify-me alerts, in-app chat, seller
ratings, moderation and admin tooling, payments, monetization, and multi-college support.
