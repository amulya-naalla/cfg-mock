const express = require('express');
const { getStudents, getStudentById, createStudent } = require('../controllers/studentController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getStudents));
router.get('/:id', asyncHandler(getStudentById));
router.post('/', asyncHandler(createStudent));

module.exports = router;
