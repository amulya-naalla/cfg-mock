require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const studentsRouter = require('./routes/students');
const assessmentsRouter = require('./routes/assessments');
const sessionsRouter = require('./routes/sessions');
const contentRouter = require('./routes/content');
const dashboardRouter = require('./routes/dashboard');
const parentSummaryRouter = require('./routes/parentSummary');
const testTranslateRouter = require('./routes/testTranslate');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/students', studentsRouter);
app.use('/api/students', parentSummaryRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/content', contentRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/_test', testTranslateRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler — any next(err) (including from asyncHandler-wrapped
// routes) lands here instead of crashing the process or leaking a raw stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

if (!process.env.MONGODB_URI) {
  console.error('Missing required environment variable: MONGODB_URI. Set it in backend/.env before starting the server.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (env: ${NODE_ENV})`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
