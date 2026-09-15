const express = require('express');
const { getStudents, getStudentById, createStudent } = require('../controllers/studentController');
const { getStudentAttendance } = require('../controllers/attendanceController');
const { createStudentNote, getStudentNotes } = require('../controllers/noteController');
const {
  getAssessmentTrend,
  getStudentProgressTimeline,
  getStudentsNeedingAttention,
  getStudentStatusEndpoint,
  getStudentRecommendationsEndpoint,
  getStudent360,
} = require('../controllers/studentAnalyticsController');

const router = express.Router();

router.get('/', getStudents);
router.post('/', createStudent);

// Static path routes MUST come before parametric /:id routes
router.get('/attention', getStudentsNeedingAttention);

// Parametric student routes
router.get('/:id', getStudentById);
router.get('/:id/attendance', getStudentAttendance);
router.get('/:id/assessment-trend', getAssessmentTrend);
router.get('/:id/progress', getStudentProgressTimeline);
router.get('/:id/status', getStudentStatusEndpoint);
router.get('/:id/recommendations', getStudentRecommendationsEndpoint);
router.get('/:id/360', getStudent360);
router.post('/:id/notes', createStudentNote);
router.get('/:id/notes', getStudentNotes);

module.exports = router;
