# Implementation Plan: CampusKart

## Overview

Tasks are ordered so the project is runnable as early as possible. The backend comes up first
with a health route, then authentication, then listings — each step verifiable with `curl`
before any UI exists. The frontend is then built page by page against a working API, so no
screen is ever coded against a guess.

Every task lists the exact commands to run where setup is involved. Two dev servers run side
by side once the frontend exists: `backend/` on port 4000 and `frontend/` on port 5173, with
Vite proxying `/api` and `/uploads` to the backend.

Automated tests are not part of this plan. Checkpoint tasks contain manual verification steps
instead.

## Tasks

- [x] 1. Scaffold the repository and backend project
  - [x] 1.1 Create the directory structure and backend Node project
    - From the repo root, run:
      `mkdir -p backend/src/middleware backend/src/routes backend/uploads frontend`
    - In `backend/`, run: `npm init -y`
    - Install runtime dependencies:
      `npm install express @prisma/client bcryptjs jsonwebtoken multer dotenv`
    - Install dev dependencies: `npm install -D prisma nodemon`
    - Add scripts to `backend/package.json`:
      `"dev": "nodemon src/index.js"` and `"start": "node src/index.js"`
    - Backend source uses CommonJS (`require`), so no `"type": "module"` entry
    - _Design: Architecture, Repository layout_

  - [x] 1.2 Add backend environment config and ignore rules
    - Run `npx prisma init --datasource-provider sqlite` in `backend/` to create
      `prisma/schema.prisma` and a starter `.env`
    - Set `backend/.env` to contain `DATABASE_URL="file:./dev.db"`,
      `JWT_SECRET="change-this-to-a-long-random-string"`, and `PORT=4000`
    - Create `backend/.gitignore` covering `node_modules`, `uploads`, `prisma/dev.db`, `.env`
    - Create `frontend/.gitignore` covering `node_modules`, `dist`, `.env`
    - _Design: Configuration and Developer Experience_

- [x] 2. Define the data model and run the first migration
  - [x] 2.1 Write the Prisma schema
    - Replace `backend/prisma/schema.prisma` with the `User` and `Listing` models from the
      design's Data Models section
    - `User`: id, name, email (`@unique`), hostel, phone, passwordHash,
      verified (default `true`), avatarUrl (optional), createdAt, listings relation
    - `Listing`: id, title, description, category, price (Int), negotiable (default `false`),
      condition, coverImageUrl, images (String, default `"[]"`), status (default `"active"`),
      views (default `0`), createdAt, seller relation + sellerId
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8, 4.1, 4.11, 4.12, 8.3_

  - [x] 2.2 Run the initial migration
    - In `backend/`, run: `npx prisma migrate dev --name init`
    - Confirm `prisma/dev.db` and `prisma/migrations/` are created
    - _Requirements: 1.1, 4.1_

  - [x] 2.3 Add the shared Prisma client and backend constants
    - Create `backend/src/prisma.js` exporting a single `PrismaClient` instance so the app
      does not open one connection pool per module
    - Create `backend/src/constants.js` exporting `CATEGORIES`
      (Books & Notes, Electronics & Gadgets, Stationery, Room & Furniture, Cycles, Others)
      and `CONDITIONS` (New, Like New, Good, Fair)
    - _Requirements: 4.4, 4.5_

- [x] 3. Build the Express application skeleton
  - [x] 3.1 Create the server entry point
    - Create `backend/src/index.js`: load `dotenv`, create the app, add `express.json()`,
      serve `backend/uploads` statically at `/uploads`, add `GET /api/health` returning
      `{ status: 'ok' }`, and listen on `process.env.PORT`
    - Create the `uploads/` directory on boot if it does not exist, so a fresh clone does not
      fail on its first upload
    - Add a JSON error-handling middleware last that maps multer's `LIMIT_FILE_SIZE` and
      file-filter rejections to `400 { error }` and anything else to `500 { error }`
    - _Requirements: 4.9, 4.10_

  - [x] 3.2 Checkpoint - server boots
    - Run `npm run dev` in `backend/` and confirm `GET http://localhost:4000/api/health`
      returns `{"status":"ok"}`
    - Ask the user if questions arise.

- [x] 4. Implement authentication
  - [x] 4.1 Write the auth middleware
    - Create `backend/src/middleware/auth.js` exporting `requireAuth`: read the
      `Authorization` header, require the `Bearer <token>` form, verify with `JWT_SECRET`,
      set `req.userId` from the payload
    - Respond `401 { error }` for a missing, malformed, or expired token
    - _Requirements: 2.3, 2.4, 3.3, 3.4_

  - [x] 4.2 Implement the signup route
    - Create `backend/src/routes/auth.js` with `POST /signup`
    - Validate that name, email, password, hostel, and phone are all present, returning
      `400 { error }` naming the missing field; validate email syntax
    - Return `409 { error }` when the email is already registered
    - Hash the password with `bcryptjs`, create the user with `verified: true`, sign a JWT with
      a 7-day expiry, and return `201 { token, user }` with `passwordHash` stripped
    - Perform all validation before the database write so a rejected signup changes nothing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [x] 4.3 Implement the login and current-user routes
    - Add `POST /login`: look up the user by email, compare with `bcrypt.compare`, and return
      `200 { token, user }` on success
    - Return the same `401 { error: 'Invalid email or password' }` for both an unknown email
      and a wrong password, so the endpoint does not reveal which accounts exist
    - Add `GET /me` behind `requireAuth`, returning the current user without `passwordHash`
    - Mount the router at `/api/auth` in `src/index.js`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.4 Checkpoint - auth works end to end
    - Sign up a user:
      `curl -X POST localhost:4000/api/auth/signup -H 'Content-Type: application/json' -d '{"name":"Test","email":"t@example.com","password":"pass1234","hostel":"H1","phone":"+919999999999"}'`
    - Log in with the same credentials and call
      `curl localhost:4000/api/auth/me -H "Authorization: Bearer <token>"`
    - Confirm a duplicate signup returns `409`, a wrong password returns `401`, and no response
      body anywhere contains `passwordHash`
    - Ask the user if questions arise.

- [x] 5. Implement listing creation with image uploads
  - [x] 5.1 Write the upload middleware
    - Create `backend/src/middleware/upload.js` using `multer.diskStorage` writing to
      `backend/uploads/` with a collision-proof filename (timestamp + random suffix + original
      extension)
    - Add a `fileFilter` rejecting any file whose mimetype does not start with `image/`
    - Set `limits: { fileSize: 5 * 1024 * 1024 }` for a 5 MB per-file cap
    - _Requirements: 4.9, 4.10_

  - [x] 5.2 Add the listing serialization helper
    - Create `backend/src/routes/listings.js` with a `serializeListing` helper that parses the
      `images` JSON string into an array, and use it as the single exit point for all listing
      responses
    - _Requirements: 4.3, 5.3, 7.2_

  - [x] 5.3 Implement the create-listing route
    - Add `POST /` guarded by `requireAuth` then
      `upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 4 }])`
    - Validate that title, category, price, condition, and a cover file are present, returning
      `400 { error }` naming what is missing
    - Validate category and condition against the fixed sets and reject `price < 0`; accept
      `price === 0` as a free item
    - Store `coverImageUrl` as `/uploads/<filename>` and the additional image URLs as a
      JSON-encoded string; set `sellerId` from `req.userId`, `status: 'active'`
    - Return `201` with the serialized listing
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.11, 4.12_

- [x] 6. Implement listing reads
  - [x] 6.1 Implement the feed route with search and filters
    - Add `GET /` accepting `q`, `category`, `condition`, `minPrice`, `maxPrice`
    - Build one Prisma `where` starting from `status: 'active'`; add an `OR` over
      `title`/`description` `contains` for `q`, exact matches for category and condition, and
      `gte`/`lte` on price, so every supplied criterion is ANDed together
    - Ignore non-numeric price params rather than erroring
    - Order by `createdAt: 'desc'` and select the seller as
      `{ id, name, hostel, verified }` — the phone must not appear here
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 6.2 Implement the my-listings route
    - Add `GET /mine` behind `requireAuth`, returning the caller's `active` listings newest
      first
    - Declare this route **before** `GET /:id` so Express does not match `mine` as an id
    - _Requirements: 8.1_

  - [x] 6.3 Implement the listing detail route
    - Add `GET /:id` using a single Prisma `update` that increments `views` and includes the
      seller as `{ id, name, hostel, phone, verified }` — the only route exposing the phone
    - Return `404` when the id is unknown or the listing status is `removed`
    - _Requirements: 3.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.8_

- [x] 7. Implement listing removal
  - [x] 7.1 Implement the soft-delete route
    - Add `DELETE /:id` behind `requireAuth`: fetch the listing, return `404` if absent,
      `403` if `sellerId !== req.userId`, and only then set `status = 'removed'`
    - Keep the row in the database; a rejected request must have no side effects
    - Mount the listings router at `/api/listings` in `src/index.js`
    - _Requirements: 3.4, 8.2, 8.3, 8.4, 8.5_

  - [x] 7.2 Checkpoint - the API is complete
    - Create a listing with a real image file:
      `curl -X POST localhost:4000/api/listings -H "Authorization: Bearer <token>" -F title=Calculator -F description=Works -F category='Electronics & Gadgets' -F price=500 -F negotiable=true -F condition=Good -F cover=@/path/to/photo.jpg`
    - Confirm a file landed in `backend/uploads/` and is reachable at
      `http://localhost:4000/uploads/<filename>`
    - Confirm the same POST without the `Authorization` header returns `401`, and that a
      non-image file and a file over 5 MB both return `400`
    - Confirm `GET /api/listings` includes the listing, its `images` is an array, and its
      `seller` has no `phone`; confirm `GET /api/listings/:id` does include `seller.phone` and
      that `views` increases on each call
    - Confirm `GET /api/listings/mine` returns the listing rather than being caught by `/:id`
    - Sign up a second user and confirm `DELETE /api/listings/:id` as that user returns `403`;
      as the owner it returns success and the listing leaves the feed
    - Ask the user if questions arise.

- [x] 8. Scaffold the frontend
  - [x] 8.1 Create the Vite React app and install dependencies
    - From the repo root, run: `npm create vite@latest frontend -- --template react`
    - In `frontend/`, run: `npm install`
    - Run: `npm install react-router-dom axios`
    - Run: `npm install tailwindcss @tailwindcss/vite`
    - _Design: Architecture, Technology decisions_

  - [x] 8.2 Configure Vite and Tailwind
    - In `frontend/vite.config.js`, add the `@tailwindcss/vite` plugin alongside the React
      plugin, set `server.port` to 5173, and proxy both `/api` and `/uploads` to
      `http://localhost:4000`
    - Replace the contents of `frontend/src/index.css` with `@import "tailwindcss";` and
      delete the boilerplate `App.css`
    - Tailwind v4 needs no `tailwind.config.js` and no PostCSS config
    - _Requirements: 9.1, 9.2_

  - [x] 8.3 Add the shared constants module and axios client
    - Create `frontend/src/constants.js` exporting `CATEGORIES` and `CONDITIONS` matching the
      backend sets, plus a `timeAgo(date)` helper returning strings like "just now", "5m ago",
      "3h ago", "2d ago"
    - Create `frontend/src/api.js` exporting an axios instance with `baseURL: '/api'` and a
      request interceptor that attaches `Authorization: Bearer <token>` from `localStorage`
      when a token is present
    - _Requirements: 2.3, 4.4, 4.5, 5.3, 7.3_

- [x] 9. Wire up session state and routing
  - [x] 9.1 Implement AuthContext
    - Create `frontend/src/context/AuthContext.jsx` providing
      `{ user, loading, login, signup, logout }`
    - On mount, if a token exists in `localStorage`, call `GET /api/auth/me` to restore the
      session; on failure clear the token and render as logged out
    - `login` and `signup` store the token, set `user`, and resolve so callers can navigate;
      `logout` clears both
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 9.2 Implement ProtectedRoute and the route table
    - Create `frontend/src/components/ProtectedRoute.jsx` that waits for `loading` before
      deciding, then renders children or redirects to `/login`
    - Create `frontend/src/App.jsx` with routes `/`, `/login`, `/signup`, `/listing/:id`,
      and protected `/post` and `/my-listings`
    - Wrap the app in `BrowserRouter` and `AuthProvider` in `frontend/src/main.jsx`
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 9.3 Checkpoint - both servers run together
    - Run `npm run dev` in `backend/` and `npm run dev` in `frontend/` in separate terminals
    - Confirm `http://localhost:5173` loads and that visiting `/post` while logged out
      redirects to `/login`
    - Ask the user if questions arise.

- [x] 10. Build the authentication pages
  - [x] 10.1 Implement the Signup page
    - Create `frontend/src/pages/Signup.jsx` with controlled inputs for name, email, password,
      hostel, and phone, with helper text that the phone must include the country code
    - Call the context `signup`, render the server's error message inline on failure, and
      navigate to `/` on success
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 9.2_

  - [x] 10.2 Implement the Login page
    - Create `frontend/src/pages/Login.jsx` with email and password inputs, calling the context
      `login`, showing the server error inline, and navigating to `/` on success
    - Include a link across to `/signup`
    - _Requirements: 2.1, 2.2, 9.2_

- [x] 11. Build the shared components
  - [x] 11.1 Implement the Navbar
    - Create `frontend/src/components/Navbar.jsx` with the CampusKart logo linking to `/`, a
      `+ Post item` action, and auth-aware links: `My listings` and `Logout` when signed in,
      `Login` and `Sign up` otherwise
    - Render it above the routed content so it appears on every page
    - _Requirements: 9.1, 9.2_

  - [x] 11.2 Implement ListingCard
    - Create `frontend/src/components/ListingCard.jsx` rendering the cover image, price,
      condition badge, title, the seller's hostel, and `timeAgo(createdAt)`, wrapped in a link
      to `/listing/:id`
    - Do not render the seller's phone number anywhere on the card
    - _Requirements: 5.3, 5.5_

- [x] 12. Build the Home feed with search and filters
  - [x] 12.1 Implement the feed with search and filter controls
    - Create `frontend/src/pages/Home.jsx` fetching `GET /api/listings` and rendering
      `ListingCard` in a `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` grid
    - Add a search input debounced by ~300ms, a category chip row including an `All` chip, a
      condition dropdown, and min and max price inputs; send only the non-empty values as
      query params and refetch when any control changes
    - Add a loading state during fetch and an empty state when no listings match
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 9.1, 9.2_

- [x] 13. Build the create-listing page
  - [x] 13.1 Implement CreateListing
    - Create `frontend/src/pages/CreateListing.jsx` with two separate file inputs: one required
      cover image and one multi-select for up to four additional images, each showing local
      preview thumbnails via `URL.createObjectURL`
    - Add title, a category select from `CATEGORIES`, price with a `negotiable` checkbox, a
      condition select from `CONDITIONS`, and a description textarea prompting
      "How old is it? Is everything working? Why are you selling?"
    - Submit as multipart `FormData` with the file fields named `cover` and `images`, and do
      not set a `Content-Type` header so the browser generates the multipart boundary
    - Show the server's validation error inline on failure; on success redirect to the new
      listing's detail page
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 9.2_

- [x] 14. Build the listing detail page
  - [x] 14.1 Implement the gallery and listing information
    - Create `frontend/src/pages/ListingDetail.jsx` fetching `GET /api/listings/:id`
    - Lay it out as two columns on desktop (gallery left, information right) and stacked on
      mobile
    - Render a main image with selectable thumbnails across the cover plus additional images
    - Render price, the negotiable indicator, title, condition and category badges,
      description, posted time via `timeAgo`, and the seller's name, hostel, and verified badge
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2_

  - [x] 14.2 Implement the contact block and owner controls
    - Determine ownership as `user?.id === listing.seller.id`
    - When the viewer is not the owner: show the phone number as text, a phone icon linking to
      `tel:<digits>`, and a green WhatsApp icon linking to `https://wa.me/<digits>` with
      `target="_blank"` and no pre-filled message; strip all non-digit characters from the
      phone for both links
    - When the viewer is the owner: replace the contact block with a red `Remove listing`
      button guarded by a `confirm()` prompt that calls `DELETE /api/listings/:id` and
      navigates away on success
    - _Requirements: 7.5, 7.6, 7.7, 8.2_

- [x] 15. Build the my-listings page
  - [x] 15.1 Implement MyListings
    - Create `frontend/src/pages/MyListings.jsx` fetching `GET /api/listings/mine`
    - Render compact rows with a thumbnail, title, price, condition, and a `Remove` action
      guarded by a `confirm()` prompt
    - Refetch the list after a successful removal so the row disappears; show an empty state
      when the seller has no active listings
    - _Requirements: 8.1, 8.2, 8.4, 9.2_

- [x] 16. Document and verify the finished app
  - [x] 16.1 Write the root README
    - Create `README.md` at the repo root with prerequisites (Node 18+), backend setup
      (`cd backend`, `npm install`, `npx prisma migrate dev --name init`, `npm run dev`), and
      frontend setup (`cd frontend`, `npm install`, `npm run dev`)
    - State that `JWT_SECRET` in `backend/.env` must be changed
    - Add a Known Limitations section: sign-up is open until the college allowlist lands;
      `verified` defaults to true for the demo so the badge is not a real identity check; phone
      numbers must include the country code for `wa.me` links to resolve; extra images are
      stored as a JSON string because SQLite has no array type
    - _Design: Configuration and Developer Experience_

  - [x] 16.2 Final checkpoint - full walkthrough
    - With both servers running, sign up, post a listing with a cover image plus two extra
      images, and confirm the redirect lands on the new detail page with all images selectable
    - Search a keyword, then combine it with category, condition, and price filters, and
      confirm results narrow correctly and stay newest-first
    - Open the listing from a second account and confirm the phone number, `tel:` link, and
      WhatsApp link appear; open it as the owner and confirm the `Remove listing` button
      appears instead
    - Remove a listing from `/my-listings` and confirm it disappears from the feed while the
      row remains in the database
    - Resize the browser to 320px wide and confirm the feed, detail page, and both forms are
      single-column with no horizontal scrolling
    - Ask the user if questions arise.

- [x] 17. Visual design pass on the frontend
  - Styling and presentation only. No API call, query parameter, route, auth rule, validation
    rule, or data flow changed, so every behavior verified in task 16.2 still holds. No new npm
    dependency: every icon is inline SVG or an emoji, and the pinned Tailwind 4.0.0 / Vite 6 /
    React Router 6 versions are untouched.

  - [x] 17.1 Establish the design system in `src/index.css` and the page shell
    - Keep `@import "tailwindcss";` and add a `@theme` block defining an indigo/violet `brand`
      palette, a warm amber `accent` palette, `whatsapp` green tokens, and an `Inter` font stack
      with a full system fallback, so colours are tokens rather than repeated hex values
    - Add a soft two-stop radial tint to `body` instead of a flat fill
    - Add reusable component classes with `@apply` in `@layer components`: `btn` plus
      `btn-primary`, `btn-gradient`, `btn-secondary`, `btn-ghost`, `btn-danger`,
      `btn-danger-quiet`, `btn-whatsapp`, `field`, `field-select`, `card`, `badge`, `chip`,
      `chip-active`, `link`, `focus-ring`, `section-title`, `alert-error`, `note`
    - Wrap animation and transition durations in a `prefers-reduced-motion: reduce` block, left
      unlayered so it outranks every layered rule
    - Load `Inter` from a `<link>` in `index.html`, update the page `<title>`, and add an inline
      SVG data-URI favicon so nothing extra has to be fetched or shipped
    - Apply the page background, max width, and vertical rhythm in `App.jsx`
    - _Requirements: 9.1, 9.2_

  - [x] 17.2 Add the inline SVG icon set (`src/components/icons.jsx`)
    - Create small `currentColor` components on a shared 24x24 grid, `aria-hidden` by default:
      search, phone, WhatsApp, location pin, plus, trash, chevron, image placeholder, tag, user,
      check badge, mail, lock, cart, plus a `Spinner` and the gradient `LogoMark` tile
    - No icon library: these are hand-written paths, so the dependency list does not grow
    - _Requirements: 9.1, 9.2_

  - [x] 17.3 Restyle the Navbar
    - Make it sticky with a translucent backdrop blur and a bottom hairline, and pair the logo
      mark with a gradient-text wordmark
    - Signed in: a circular initial avatar chip with the first name, `My listings`, and a quieter
      `Logout`; signed out: `Login` as a text link and `Sign up` as a solid button
    - Give `+ Post item` a gradient treatment with a plus icon that collapses to icon-only below
      `sm`, keeping its accessible name, so nothing wraps badly at 320px
    - _Requirements: 9.1, 9.2_

  - [x] 17.4 Restyle the Home feed
    - Add a gradient hero band carrying the headline, a one-line subhead, and the search field
      with a leading search icon as the focal point
    - Give each category chip its emoji and a pill style with a clear active state, keeping
      `aria-pressed`; tidy condition and min/max price into one aligned filter bar
    - Show a result count and, when any filter is active, a `Clear all` chip that resets the
      controls; keep the count in its own polite live region and the reset control out of one
    - Replace the loading text with skeleton cards shaped like the real card, and make the empty
      state a centred block with an icon, headline, sentence, and a `Post an item` call to action
    - Keep the feed grid at `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
    - _Requirements: 9.1, 9.2_

  - [x] 17.5 Restyle ListingCard
    - Rounded-2xl with a soft shadow, a hover lift, a gentle cover zoom, and a visible focus ring
    - Make the price the strongest element, render a free item as a green pill, colour-code the
      condition badge by value, add a `Negotiable` tag when applicable, put a pin icon before the
      hostel, keep `timeAgo` muted, and clamp the title to two lines
    - Fall back to a neutral placeholder block with the image icon when the cover fails to load
    - Still no seller phone number anywhere on the card
    - _Requirements: 5.5, 9.1, 9.2_

  - [x] 17.6 Restyle ListingDetail
    - Add a back link to the feed, enlarge the gallery with rounded corners and a soft border,
      ring the active thumbnail, and dim the inactive ones until hover
    - Build a price block that leads with the amount and the `Negotiable` pill, then the title,
      colour-coded condition and category badges, and the posted time; give the description its
      own lightly separated section
    - Turn the seller block into a card with a circular initial avatar, the name, a check-badge
      `Verified` pill, and the hostel with a pin icon
    - Give the contact actions phone and WhatsApp icons with the WhatsApp button in its brand
      green, show the number in a monospace tabular treatment, and style the "deals happen in
      person" line as a soft info note
    - Let the right column stick as the gallery scrolls on desktop, and keep the owner's
      `Remove listing` control destructive but quiet
    - The phone number, `tel:` link, and `wa.me` link remain on this view only, and the owner
      still sees the Remove control in place of the whole contact block
    - _Requirements: 5.5, 7.7, 9.1, 9.2_

  - [x] 17.7 Restyle CreateListing
    - Wrap the form in a card and group it into `Photos`, `Item details`, `Pricing`, and
      `Description` sections separated by light dividers
    - Replace both raw file inputs with dashed drop-zone labels carrying the image icon and
      helper text, with the real input `sr-only` inside the label so it stays keyboard reachable
      and screen-reader labelled
    - Show the cover preview large and the extras as a thumbnail row, each with a trash button
      that clears the selection and resets the input, plus a `2 / 4 added` counter
    - Keep the 5 MB and image-only helper text, the extras-over-limit handling, and the
      description placeholder prompt exactly as they were
    - Make the submit a full-width gradient button with a spinner in its loading state
    - _Requirements: 9.1, 9.2_

  - [x] 17.8 Restyle the Login and Signup pages
    - Centre both as an auth card with a gradient header strip carrying the logo mark, a clear
      heading and subhead, generous field spacing, and leading icons inside the inputs
    - Make the submit full-width with a spinner while submitting, and style the cross-link to the
      other page as a clear footer row
    - Keep every `<label htmlFor>` association, the phone country-code helper text, and its
      `aria-describedby` wiring
    - _Requirements: 9.1, 9.2_

  - [x] 17.9 Restyle MyListings
    - Turn the rows into hover-highlighted cards with a larger thumbnail, the title, a price
      pill, a colour-coded condition badge, the posted time, and the view count when the payload
      carries one
    - Make `Remove` a quiet destructive button that shows a spinner while removing, and give the
      empty state the same treatment as the feed
    - _Requirements: 9.1, 9.2_

  - [x] 17.10 Checkpoint - the design pass builds and stays accessible
    - Run `npm run build` in `frontend/` and confirm it compiles with no Tailwind or JSX errors
    - Confirm every input keeps its `<label htmlFor>` association, the feed results region keeps
      `aria-live`, errors keep `role="alert"`, the category chips keep `aria-pressed`, alt text
      is still correct, and every interactive element has a visible `focus-visible` ring
    - Confirm the feed, listing detail, and both forms stay single-column with no horizontal
      scrolling at a 320px viewport, and that the feed grid still breaks at 2 / md:3 / lg:4
    - _Requirements: 5.5, 7.7, 9.1, 9.2_

## Notes

- Tasks are sequenced so the backend is verifiable with `curl` before any UI is written, and
  each frontend page is built against a working endpoint.
- `GET /api/listings/mine` must be declared before `GET /api/listings/:id` (task 6.2). This is
  the single most likely wiring mistake in the API.
- The seller's phone number appears in exactly one API response shape and one UI location. Any
  other appearance is a bug against Requirement 5.5.
- No automated tests are included, per the current scope. Checkpoint tasks carry manual
  verification steps instead.
- Out of scope throughout: wanted posts, favorites, notify-me alerts, admin and moderation,
  seller ratings, payments, monetization, multi-college support, and in-app chat.
