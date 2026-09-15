# cfg-mock

## Structure

- `backend/` — Express + MongoDB Atlas API
- `frontend/` — React (Vite) educator app
- `docs/` — architecture, API contract, and per-owner scope docs

See [docs/00-ARCHITECTURE-AND-CONTRACT.md](docs/00-ARCHITECTURE-AND-CONTRACT.md) for the API contract and role breakdown.

## Getting started

### Backend

```bash
cd backend
cp .env.example .env   # set MONGODB_URI
npm install
npm run seed            # populate Atlas once
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL
npm install
npm run dev
```
