const mongoose = require('mongoose');
const Intervention = require('../models/Intervention');
const Student = require('../models/Student');

async function createIntervention(req, res) {
  try {
    const { student_id, educator_id, subject, issue, action, status, notes, date } = req.body;
    if (!student_id || !mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ error: 'Valid student_id is required' });
    }
    if (!educator_id || !subject || !issue || !action) {
      return res.status(400).json({ error: 'educator_id, subject, issue, and action are required' });
    }

    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const intervention = await Intervention.create({
      student_id,
      educator_id,
      subject,
      issue,
      action,
      status: status || 'planned',
      notes: notes || '',
      date: date || new Date(),
    });

    res.status(201).json(intervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getInterventions(req, res) {
  try {
    const { student_id, educator_id, status } = req.query;
    const filter = {};
    if (student_id) {
      if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({ error: 'Invalid student_id format' });
      }
      filter.student_id = student_id;
    }
    if (educator_id) filter.educator_id = educator_id;
    if (status) filter.status = status;

    const interventions = await Intervention.find(filter)
      .populate('student_id', 'name grade cluster district')
      .sort({ date: -1 });

    res.json(interventions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateIntervention(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid intervention ID' });
    }

    const updates = req.body;
    if (updates.status && !['planned', 'active', 'completed', 'cancelled'].includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const intervention = await Intervention.findByIdAndUpdate(id, updates, { new: true });
    if (!intervention) {
      return res.status(404).json({ error: 'Intervention not found' });
    }

    res.json(intervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createIntervention, getInterventions, updateIntervention };
