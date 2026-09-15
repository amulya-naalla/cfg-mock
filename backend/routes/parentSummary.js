const express = require('express');
const { generateParentSummary } = require('../controllers/parentSummaryController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/:id/parent-summary', asyncHandler(generateParentSummary));

module.exports = router;
