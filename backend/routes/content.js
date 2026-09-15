const express = require('express');
const { getContent, translateContent, translateAll } = require('../controllers/contentController');

const router = express.Router();

router.post('/translate-all', translateAll);
router.get('/:id', getContent);
router.post('/:id/translate', translateContent);

module.exports = router;
