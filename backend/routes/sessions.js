const express = require('express');
const { createSession, getSessions } = require('../controllers/sessionController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getSessions));
router.post('/', asyncHandler(createSession));

module.exports = router;
