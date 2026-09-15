# Backend: API & Data

Owner: B

## Scope

- Express server setup (`backend/server.js`)
- MongoDB Atlas connection (`backend/config/db.js`)
- Models: Student, Assessment, Content
- Routes/controllers for students, assessments, and the dashboard summary
- Flagging logic (`backend/controllers/assessmentController.js`)
- Seed script (`backend/seed/seed.js`)

## Notes

- Set `MONGODB_URI` in `backend/.env` (copy from `.env.example`, not committed).
- Run `npm run seed` once to populate Atlas before a demo.
