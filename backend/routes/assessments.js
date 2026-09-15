const express = require('express');
const { createAssessment, getAssessments } = require('../controllers/assessmentController');

const router = express.Router();

router.post('/', createAssessment);
router.get('/', getAssessments);

module.exports = router;
