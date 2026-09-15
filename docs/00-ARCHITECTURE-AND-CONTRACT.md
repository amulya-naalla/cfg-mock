# Architecture & API Contract

Owner: whole team (source of truth for the API contract between frontend and backend).

## Overview

- Frontend: React (Vite) SPA in `frontend/`, talks to the backend over HTTP via `VITE_API_BASE_URL`.
- Backend: Express + MongoDB Atlas in `backend/`.
- Roles: A = frontend/educator app, B = backend core API, C = integration/localization/AI, D = dashboard/analytics.

## API Contract

| Method | Path | Owner | Description |
| --- | --- | --- | --- |
| GET | `/api/students` | B | List students |
| POST | `/api/students` | B | Create a student |
| POST | `/api/assessments` | B | Submit an assessment |
| GET | `/api/assessments?student_id=` | B | List assessments for a student |
| GET | `/api/content/:id` | C | Get content by id |
| POST | `/api/content/:id/translate` | C | Translate content into a target language |
| POST | `/api/students/:id/parent-summary` | C | Generate an AI parent summary |
| GET | `/api/dashboard/summary` | B/D | Aggregate stats for the dashboard |

Update this table whenever a route's shape changes — it's the contract everyone else codes against.
