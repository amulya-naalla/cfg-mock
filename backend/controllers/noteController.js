const mongoose = require('mongoose');
const StudentNote = require('../models/StudentNote');
const Student = require('../models/Student');

async function createStudentNote(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { educator_id, note, date } = req.body;
    if (!educator_id || !note) {
      return res.status(400).json({ error: 'educator_id and note text are required' });
    }

    const newNote = await StudentNote.create({
      student_id: id,
      educator_id,
      note,
      date: date || new Date(),
    });

    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getStudentNotes(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const notes = await StudentNote.find({ student_id: id }).sort({ date: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createStudentNote, getStudentNotes };
