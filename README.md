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

The `main` branch remains the original deployed frontend until the backend development pull request is reviewed and merged. `backup/pre-backend-2026-11-04` preserves the original commit as a separate branch. Your personal private backup repository is independent and is not accessed by this work.

## Deployment and thesis demo

[Read the complete local setup, Render + Atlas + GitHub Pages deployment guide and test checklist.](backend/README.md)
