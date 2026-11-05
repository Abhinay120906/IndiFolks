# IndiFolks backend — thesis demo

This is a Node.js/Express and MongoDB API for the IndiFolks React frontend. It supports customer and artist registration, admin approval, artist profiles, bookings, reviews, and a **clearly labeled simulated-payment flow** (with optional Razorpay TEST routes kept for future work). Development is isolated on the `feature/backend-development` branch.

## Prerequisites

- Node.js 20 or newer
- MongoDB Atlas M0 (free) database and a database user
- Optional: Cloudinary account for profile/gallery image storage
- No Razorpay account, PAN, or card details needed for the built-in demo checkout

## Local installation

1. Run `cd backend && npm install`.
2. Copy `.env.example` to `.env` inside the backend directory.
3. Set `MONGODB_URI`, and choose a random `JWT_SECRET` of at least 32 characters. Configure `CLIENT_ORIGINS=http://localhost:8080,http://localhost:5173` for local development.
4. Run `npm run dev`. Visit `http://localhost:5000/api/health` and verify `db` is `connected`.
5. In the repository root create `.env.local` with `VITE_API_URL=http://localhost:5000`, run `npm ci` and `npm run dev`.
6. Admin setup: set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters) and optionally `ADMIN_NAME` in backend `.env`. Run `npm run create-admin` once from the backend folder. Delete the admin password from environment afterward. Public admin registration is intentionally disabled.
7. Cloud image uploads are optional and require configuring a Cloudinary account (see the **Image uploads** section below). Without Cloudinary, artist text/profile/pricing changes still work, but image controls are disabled and an informative notice is displayed.
8. Set `ENABLE_DEMO_PAYMENTS=true` in your backend `.env` **only** for a thesis demonstration, then restart the backend. Render's thesis-demo Blueprint is configured with this flag already. This records `demo_paid` separately from any actual payment. No Razorpay keys or PAN are needed. **Disable this flag in any real marketplace deployment.**

**Do not upload your .env or share account passwords or API secrets in chat or on GitHub.**

## Image uploads — Cloudinary (no keys in GitHub)

The upload API is implemented, but it cannot store actual pictures until **you** create or connect a Cloudinary account and configure the credentials. Image files go directly from the browser to the backend, then to Cloudinary; their permanent HTTPS links are saved to MongoDB. Render's temporary filesystem is never used as image storage.

1. Create or sign in to a Cloudinary account at https://cloudinary.com/ (a free plan may be available; check your account terms).
2. In your Cloudinary Console, find **Cloud name**, **API Key** and **API Secret** (the console wording may change).
3. On your computer, open `backend/.env` inside your cloned IndiFolks repository and enter these values, leaving existing MongoDB and JWT settings intact:
   ```dotenv
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_secret
   ```
4. Restart the local backend after saving `.env` so the new variables are loaded.
5. To enable uploads on the Render-hosted backend, open the **indifolks-api** service → **Environment** in Render and add the same three values as secret environment variables. Save/redeploy. **Never paste any secret in this chat or GitHub**. A Cloudinary API Secret must never use the `VITE_` prefix.
6. Sign in as an artist → **Dashboard → Edit Profile**. Choose a profile photo or gallery images, then click **Save Profile Changes**. Go to the public artist profile and refresh. Uploaded photos should persist across page refreshes and Render restarts.

Uploads accept JPG, PNG or WebP, up to 4 MB each. Upload at most 8 gallery pictures per request and keep at most 24 gallery pictures in total. A previous profile photo and deleted gallery photos are removed from Cloudinary after successful database updates where possible. If Cloudinary is not configured, the dashboard tells you instead of pretending a photo was saved.

**Profile Strength** is calculated by the backend from nine saved artist details: stage name, specialty, state, bio, experience, positive price, artistic story, profile photo, and at least one gallery image. Optional awards or pricing packages do not affect this score. The percentage and missing-item checklist update when artists save changes.

## Demo workflow

1. Create admin with the script.
2. Register an artist (profile image optional). Sign in as admin at `/admin/login`, then approve the pending artist.
3. Sign in as the artist, enter a valid positive price in the dashboard, then become available.
4. Register a customer, browse the artist page, and request a booking for a future date.
5. Artist accepts the request in the artist dashboard.
6. Customer visits `/bookings`, chooses **Simulate payment — no money charged**, and explicitly confirms the demo. The server marks the booking `demo_paid` with a unique demo receipt. No payment gateway is called and no money moves.
7. The artist can mark a demo-paid booking completed while demo mode is enabled. After completion, a customer can submit a test review.

## API

- GET `/api/health`, GET `/api/stats`
- POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/admin-login`, GET `/api/auth/me`, PUT `/api/auth/profile`
- GET `/api/artists`, GET `/api/artists/:id`, GET `/api/artists/me` (includes completeness and image upload status), PUT `/api/artists/profile` (multipart photo/gallery upload and deletion), POST `/api/artists/:id/reviews`, GET/PATCH `/api/artists/:id/my-review`
- POST `/api/bookings`, GET `/api/bookings/my`, GET `/api/bookings/artist`, PATCH `/api/bookings/:id`
- POST `/api/demo-payments/confirm` (customer-authenticated, ownership checked, opt-in `ENABLE_DEMO_PAYMENTS=true`, demo-only)
- Legacy optional Razorpay TEST routes remain at POST `/api/payments/orders` and POST `/api/payments/verify` but are not used by the frontend
- GET `/api/admin/artists`, GET `/api/admin/users`, GET `/api/admin/bookings`, PATCH `/api/admin/artists/:id/approve`, PATCH `/api/admin/artists/:id/reject`, DELETE `/api/admin/users/:id`
- GET `/api/states`, GET `/api/states/:id`

## Zero-cost hosting for thesis demonstrations

### Database — MongoDB Atlas

Create an M0 free cluster and user. Use the SRV connection URI as Render's `MONGODB_URI`. In Atlas network access, allow your backend server's outbound connections; broad allowlisting reduces security and should be avoided if fixed IP is available. Never place the URI in client-side variables.

### API — Render free Web Service

1. On Render select **New > Web Service**, link this repository.
2. Use `main` only **after you have reviewed and merged the pull request**.
3. **Root directory**: `backend`; **Build command**: `npm install`; **Start command**: `npm start`.
4. Set the environment variables `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGINS=https://abhinay120906.github.io`. Optionally set Razorpay TEST keys and Cloudinary keys. Render sets `PORT`.
5. Deploy and open `https://YOUR-RENDER-NAME.onrender.com/api/health`. It should say `{"ok":true,"db":"connected"}`.

Free Render services can sleep during inactivity. They are suitable for demos, not for guaranteeing a high-availability commercial service.

### Frontend — GitHub Pages

The Vite production build uses `/IndiFolks/` as the base path. On GitHub, configure your Pages build or deployment workflow to include the **public** frontend variable:

`VITE_API_URL=https://YOUR-RENDER-NAME.onrender.com`

Then build with `npm ci && npm run build` and publish the `dist` output. Vite environment variables are baked into the compiled site at build time; a GitHub repository variable alone is not enough unless the build reads it. The React Router basename follows the same Vite base path. Verify login, artist approvals, bookings and test checkout after publishing.

## Safety and limitations

- Do not merge to `main` before reviewing the code and running the test checklist; the original `main` is untouched.
- No public admin signup and no Aadhaar storage. Do not collect real identity documents for a thesis demo.
- Never deploy live payment keys. Real-money marketplaces need separate onboarding, payment reconciliation/webhooks, refund handling, payout compliance, audit records, stronger concurrency controls and security reviews.
- **No real payments are collected.** A `demo_paid` booking is proof of a simulated workflow only, not payment verification, a receipt of funds, or a payout obligation. Keep real-payment production services disabled or separately implemented. Image files require Cloudinary (the Render free filesystem is not persistent).
- Booking requests and approvals check for whole-day conflicts, with a partial unique index for confirmed/completed event days. Production reservation systems still need comprehensive concurrency and cancellation testing.
- The state cultural catalog is illustrative and the metadata is not a scholarly reference.
- Free tiers, resource limits, and policies are subject to change.

## Review checklist

1. `npm run build` succeeds for the frontend, `node --check` succeeds for all backend files, and `npm test` passes in backend.
2. New customer can register and log in, admin signup is denied, admin can approve artist.
3. Artist can update profile/price/availability and accepts a request.
4. Customer sees confirmed booking in /bookings and records a **simulated demo payment** (no money charged).
5. Wrong JWT, mismatched user role, invalid booking ID, and forged payment signature are rejected.
6. Review access is limited to customers with a paid and completed booking.
7. Atlas, Render and Pages health checks and real browser flows work.

