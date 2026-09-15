const express = require('express');
const { linkTelegram } = require('../controllers/telegramController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/link', asyncHandler(linkTelegram));

module.exports = router;
