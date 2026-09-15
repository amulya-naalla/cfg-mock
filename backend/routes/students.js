const express = require('express');
const { getStudents, getStudentById, createStudent } = require('../controllers/studentController');

const router = express.Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent);

module.exports = router;
