const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/summary', asyncHandler(getSummary));

module.exports = router;
