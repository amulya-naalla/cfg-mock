# Architecture & API Contract

Owner: whole team (source of truth for the API contract between frontend and backend).

## Overview

- Frontend: React (Vite) SPA in `frontend/`, talks to the backend over HTTP via `VITE_API_BASE_URL`.
- Backend: Express + MongoDB Atlas in `backend/`.
- Roles: A = frontend/educator app, B = backend core API, C = integration/localization/AI, D = dashboard/analytics.

## API Contract

| Method | Path | Owner | Description |
| --- | --- | --- | --- |
| GET | `/api/students` | B | List/search students (`?search=`, `?district=`, `?cluster=`, `?grade=`, `?language=`, `?flagged=`) |
| GET | `/api/students/attention` | B | List students needing attention sorted by gap |
| GET | `/api/students/:id` | B | Get student profile + assessments array |
| POST | `/api/students` | B | Create a student |
| GET | `/api/students/:id/attendance` | B | Get student attendance metrics |
| GET | `/api/students/:id/assessment-trend` | B | Calculate student assessment score trend |
| GET | `/api/students/:id/progress` | B | Chronological student event timeline |
| GET | `/api/students/:id/status` | B | Rule-based student status & reasons |
| GET | `/api/students/:id/recommendations` | B | Rule-based subject/gap recommendations |
| GET | `/api/students/:id/360` | B | Aggregated Student 360 profile payload |
| POST | `/api/students/:id/notes` | B | Log contextual educator note for student |
| GET | `/api/students/:id/notes` | B | Get notes for student |
| POST | `/api/assessments` | B | Submit assessment (computes `flagged` server-side) |
| GET | `/api/assessments?student_id=` | B | List assessments for student |
| POST | `/api/sessions` | B | Log educator field session |
| GET | `/api/sessions?educator_id=` | B | List sessions by educator or cluster |
| POST | `/api/sessions/:id/attendance` | B | Bulk record individual student session attendance |
| POST | `/api/interventions` | B | Create targeted guidance intervention |
| GET | `/api/interventions?student_id=` | B | List interventions for student/educator |
| PATCH | `/api/interventions/:id` | B | Update status/notes for intervention |
| GET | `/api/educators/:id/students` | B | Roster of students for educator |
| GET | `/api/educators/:id/summary` | B | Educator activity & reach metrics |
| GET | `/api/content/:id` | C | Get content by id |
| POST | `/api/content/:id/translate` | C | Translate content into a target language |
| POST | `/api/students/:id/parent-summary` | C | Generate an AI parent summary |
| GET | `/api/dashboard/summary` | B/D | Aggregate stats for the dashboard |

Update this table whenever a route's shape changes — it's the contract everyone else codes against.
