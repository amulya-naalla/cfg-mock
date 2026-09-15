const express = require('express');
const { getEducatorStudents, getEducatorSummary } = require('../controllers/educatorController');

const router = express.Router();

router.get('/:id/students', getEducatorStudents);
router.get('/:id/summary', getEducatorSummary);

module.exports = router;
