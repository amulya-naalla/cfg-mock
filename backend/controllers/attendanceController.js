const mongoose = require('mongoose');
const Session = require('../models/Session');
const Student = require('../models/Student');
const SessionAttendance = require('../models/SessionAttendance');

async function recordSessionAttendance(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { attendance } = req.body;
    if (!Array.isArray(attendance)) {
      return res.status(400).json({ error: 'Attendance array is required' });
    }

    const operations = [];
    for (const item of attendance) {
      if (!item.student_id || !mongoose.Types.ObjectId.isValid(item.student_id)) {
        continue;
      }
      const status = ['present', 'absent', 'late'].includes(item.status) ? item.status : 'present';
      operations.push({
        updateOne: {
          filter: { session_id: id, student_id: item.student_id },
          update: {
            $set: {
              status,
              recorded_at: new Date(),
            },
          },
          upsert: true,
        },
      });
    }

    if (operations.length > 0) {
      await SessionAttendance.bulkWrite(operations);
    }

    // Recalculate present/late attendance count for the session
    const attendedCount = await SessionAttendance.countDocuments({
      session_id: id,
      status: { $in: ['present', 'late'] },
    });
    session.attendance_count = attendedCount;
    await session.save();

    const updatedAttendance = await SessionAttendance.find({ session_id: id }).populate('student_id', 'name grade cluster');
    res.status(200).json({
      message: 'Attendance recorded successfully',
      session_id: id,
      attendance_count: attendedCount,
      records: updatedAttendance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentAttendance(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const records = await SessionAttendance.find({ student_id: id }).populate('session_id', 'date topic educator_id cluster');

    const total_sessions = records.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    for (const rec of records) {
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;
    }

    const attended = present + late;
    const attendance_percentage = total_sessions > 0 ? Number(((attended / total_sessions) * 100).toFixed(1)) : 0;

    res.json({
      student_id: id,
      total_sessions,
      present,
      absent,
      late,
      attendance_percentage,
      records,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { recordSessionAttendance, getStudentAttendance };
