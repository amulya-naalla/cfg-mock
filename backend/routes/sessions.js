const express = require('express');
const { createSession, getSessions } = require('../controllers/sessionController');
const { recordSessionAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', getSessions);
router.post('/', createSession);
router.post('/:id/attendance', recordSessionAttendance);

module.exports = router;
