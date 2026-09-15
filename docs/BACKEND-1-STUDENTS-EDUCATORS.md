# Backend 1 — Students + Educators/Volunteers
**Stakeholders covered: Students, Community Educators/Volunteers**
**Reads `00-ARCHITECTURE-AND-CONTRACT.md` first.** You own the collections that represent the
day-to-day ground-truth data of the program: who the students are, how they're assessed, and what
educators/volunteers are doing in the field. You are also critical path for the first 20 minutes —
nobody on the team can build against real data until your server exists and is reachable.

---

## Collections you own

### `students`
| field | type |
|---|---|
| _id | ObjectId |
| name | String |
| grade | Number |
| district | String |
| cluster | String |
| language_pref | String |
| guardian_name | String |
| guardian_contact | String |

### `assessments`
| field | type |
|---|---|
| _id | ObjectId |
| student_id | ObjectId (ref) |
| date | Date |
| subject | String |
| score | Number |
| grade_level_expected | Number |
| flagged | Boolean (computed server-side) |

### `sessions` — **now core, not stretch** (this is what makes Educators/Volunteers a real
user of the system, not just an implicit data-entry role)
| field | type |
|---|---|
| _id | ObjectId |
| date | Date |
| educator_id | String (stub — hardcoded name/id, no real auth) |
| cluster | String |
| topic | String |
| attendance_count | Number |

---

## Implementation plan

### 1. (0:00–0:20) Stand up the server — DO THIS FIRST, for the whole team
- MongoDB Atlas free-tier cluster (shared, cloud — not local Mongo).
- Bare Express app + Mongoose connection.
- One working route first: `GET /api/students` returning `[]`, to prove the chain works.
- Run `ngrok http 5000`, **immediately share the URL + full API contract with the whole team.**
  Both frontend people and Backend 2 are blocked without this.

### 2. (0:20–0:40) Seed data
- **10–15 students** across the 3 districts/clusters, varied grades, realistic Tamil Nadu names.
- **~20 assessments** — mix of flagged/unflagged scores so the demo shows real gaps.
- **5–6 sessions** — a few different educators, spread across clusters/dates, varied topics
  ("Reading Circle", "Math Basics", "Life Skills Workshop").

### 3. (0:40–1:40) Student & assessment routes
| Method | Route | Behavior |
|---|---|---|
| `GET` | `/api/students` | List all; optional `?cluster=` filter |
| `GET` | `/api/students/:id` | One student + their assessments |
| `POST` | `/api/students` | Create (mainly for seeding) |
| `POST` | `/api/assessments` | Create; **compute `flagged` server-side**: `flagged = score < grade_level_expected - 15` (named constant, easy to tune live) |
| `GET` | `/api/assessments?student_id=` | Assessments for one student |

### 4. (1:40–2:40) Educator/volunteer session routes
| Method | Route | Behavior |
|---|---|---|
| `POST` | `/api/sessions` | Log a session an educator ran |
| `GET` | `/api/sessions?educator_id=` | "My sessions" — what this educator has logged |
| `GET` | `/api/sessions?cluster=` | Sessions in a cluster (useful for leadership-side visibility, Backend 2 may call this) |

This is the piece that actually gives educators/volunteers something of their own in the system —
not just a tool for entering data about students, but a way to see their own activity.

### 5. (2:40–3:00) Prep for Backend 2's dependency
Backend 2's dashboard needs to read across your `students`/`assessments`/`sessions` collections.
Confirm exact field names with them before the 3:00 sync so there's no shape mismatch.

### 6. (3:00 sync onward) Glue + firefighting
- Fix mismatches Frontend 1 (educator flow, student list/detail/assessment form) surfaces.
- Keep server + ngrok alive; re-share the URL immediately if it ever restarts.
- Re-seed data if it gets mangled during testing.

## Explicitly out of scope for you
- `content`, `translate`, `parent-summary`, `dashboard/summary` routes — Backend 2 owns these
- Real auth — `educator_id` is a hardcoded stub, not a login system
- Input validation beyond "doesn't crash the server"

## Checkpoints
- **0:20** — Server + ngrok URL shared with team.
- **0:40** — Seed data (students, assessments, sessions) live in Atlas.
- **1:40** — Student/assessment routes done, flag logic confirmed.
- **2:40** — Session routes done.
- **3:00 sync** — Field names confirmed with Backend 2 for dashboard aggregation.
