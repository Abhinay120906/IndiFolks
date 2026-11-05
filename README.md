# IndiFolks

IndiFolks is a B.Tech thesis demonstration marketplace for discovering India's traditional artists and booking them for events.

**Frontend:** React + TypeScript + Vite + Tailwind CSS (GitHub Pages)  
**Backend:** Node.js + Express (Render free service)  
**Database:** MongoDB Atlas  
**Payments:** Razorpay **test mode** (simulated payments; no real money moves)

## Development

- Frontend: `npm ci && npm run dev`
- Backend: see [backend/README.md](backend/README.md)
- Frontend `.env.local`: `VITE_API_URL=http://localhost:5000`
- Backend `backend/.env`: copy from [backend/.env.example](backend/.env.example) and supply your own credentials.

The frontend depends on a running API service. Do not commit secrets. To make the marketplace publicly functional, deploy the backend/database first, then deploy the frontend with its `VITE_API_URL` pointed at the actual backend HTTPS URL.

## Keeping the original code safe

IndiFolks is published from `main` by a GitHub Actions workflow that builds the React app and updates the `gh-pages` branch. The `backup/pre-backend-2026-11-04` branch preserves the original code. Your separate private backup repository is independent and is not accessed by deployment.

## Deployment and thesis demo

[Read the complete local setup, Render + Atlas + GitHub Pages deployment guide and test checklist.](backend/README.md)


## Public website

- GitHub Pages: https://abhinay120906.github.io/IndiFolks/
- Published sources: `main`; deployment output: `gh-pages`
- API: https://indifolks-api.onrender.com/api/health

The web interface runs on GitHub Pages; dynamic bookings, registration, and demo payments are processed by the separate Render API and MongoDB Atlas. The Render free service can take extra time to respond when idle.

GitHub Pages is static hosting and does **not** run the Express backend. Do not put database or cloud-service secrets in frontend build variables. All test payments must remain explicitly labeled as simulated and never collect real money.
