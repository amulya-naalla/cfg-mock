const express = require('express');
const { generateParentSummary } = require('../controllers/parentSummaryController');

const router = express.Router();

router.post('/:id/parent-summary', generateParentSummary);

module.exports = router;
