const express = require('express');
const { getContent, translateContent, translateAll } = require('../controllers/contentController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/translate-all', asyncHandler(translateAll));
router.get('/:id', asyncHandler(getContent));
router.post('/:id/translate', asyncHandler(translateContent));

module.exports = router;
