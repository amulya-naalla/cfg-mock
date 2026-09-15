const express = require('express');
const { getContent, translateContent } = require('../controllers/contentController');

const router = express.Router();

router.get('/:id', getContent);
router.post('/:id/translate', translateContent);

module.exports = router;
