require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const studentsRouter = require('./routes/students');
const assessmentsRouter = require('./routes/assessments');
const sessionsRouter = require('./routes/sessions');
const interventionsRouter = require('./routes/interventions');
const educatorsRouter = require('./routes/educators');
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
app.use('/api/interventions', interventionsRouter);
app.use('/api/educators', educatorsRouter);
app.use('/api/content', contentRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/_test', testTranslateRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
