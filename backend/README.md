# IndiFolks backend — thesis demo

This is a Node.js/Express and MongoDB API for the IndiFolks React frontend. It supports customer and artist registration, admin approval, artist profiles, bookings, reviews, and **Razorpay TEST payments**. Development is isolated on the `feature/backend-development` branch.

## Prerequisites

- Node.js 20 or newer
- MongoDB Atlas M0 (free) database and a database user
- Optional: Cloudinary account for profile/gallery image storage
- Optional: Razorpay **test** API keys for simulated checkout

## Local installation

1. Run `cd backend && npm install`.
2. Copy `.env.example` to `.env` inside the backend directory.
3. Set `MONGODB_URI`, and choose a random `JWT_SECRET` of at least 32 characters. Configure `CLIENT_ORIGINS=http://localhost:8080,http://localhost:5173` for local development.
4. Run `npm run dev`. Visit `http://localhost:5000/api/health` and verify `db` is `connected`.
5. In the repository root create `.env.local` with `VITE_API_URL=http://localhost:5000`, run `npm ci` and `npm run dev`.
6. Admin setup: set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters) and optionally `ADMIN_NAME` in backend `.env`. Run `npm run create-admin` once from the backend folder. Delete the admin password from environment afterward. Public admin registration is intentionally disabled.
7. For uploaded images, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` on the backend. For now image selection is optional during artist signup, allowing the basic workflow without Cloudinary.
8. To enable checkout, add `RAZORPAY_KEY_ID=rzp_test_...` and `RAZORPAY_KEY_SECRET=...` to the **backend only**. No live keys are accepted.

**Do not upload your .env or share account passwords or API secrets in chat or on GitHub.**

## Demo workflow

1. Create admin with the script.
2. Register an artist (profile image optional). Sign in as admin at `/admin/login`, then approve the pending artist.
3. Sign in as the artist, enter a valid positive price in the dashboard, then become available.
4. Register a customer, browse the artist page, and request a booking for a future date.
5. Artist accepts the request in the artist dashboard.
6. Customer visits `/bookings` and clicks **Pay now (test mode)**. Use the Razorpay-provided test payment method, not real money.
7. Successful captured test payment is verified server-side. Artist can mark the paid booking completed. Customer can post one review after completion.

## API

- GET `/api/health`, GET `/api/stats`
- POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/admin-login`, GET `/api/auth/me`, PUT `/api/auth/profile`
- GET `/api/artists`, GET `/api/artists/:id`, GET `/api/artists/me`, PUT `/api/artists/profile`, POST `/api/artists/:id/reviews`
- POST `/api/bookings`, GET `/api/bookings/my`, GET `/api/bookings/artist`, PATCH `/api/bookings/:id`
- POST `/api/payments/orders`, POST `/api/payments/verify`
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
- Real paid bookings are not supported by this demo. Image files require Cloudinary (the Render free filesystem is not persistent).
- Booking date conflicts use simple database checks, not transactional per-day locking. Do not use for production reservations.
- The state cultural catalog is illustrative and the metadata is not a scholarly reference.
- Free tiers, resource limits, and policies are subject to change.

## Review checklist

1. `npm run build` succeeds for the frontend, `node --check` succeeds for all backend files, and `npm test` passes in backend.
2. New customer can register and log in, admin signup is denied, admin can approve artist.
3. Artist can update profile/price/availability and accepts a request.
4. Customer sees booking in /bookings and pays using Razorpay **test** mode.
5. Wrong JWT, mismatched user role, invalid booking ID, and forged payment signature are rejected.
6. Review access is limited to customers with a paid and completed booking.
7. Atlas, Render and Pages health checks and real browser flows work.

