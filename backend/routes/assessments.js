const express = require('express');
const { createAssessment, getAssessments } = require('../controllers/assessmentController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(createAssessment));
router.get('/', asyncHandler(getAssessments));

module.exports = router;
