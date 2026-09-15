const mongoose = require('mongoose');
const Session = require('../models/Session');
const SessionAttendance = require('../models/SessionAttendance');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

async function getEducatorStudents(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Educator ID is required' });
    }

    // 1. Find sessions run by educator
    const educatorSessions = await Session.find({ educator_id: id });
    const sessionIds = educatorSessions.map((s) => s._id);
    const educatorClusters = [...new Set(educatorSessions.map((s) => s.cluster).filter(Boolean))];

    // 2. Find direct attendance student IDs
    const attendanceRecords = await SessionAttendance.find({ session_id: { $in: sessionIds } });
    const directStudentIds = [...new Set(attendanceRecords.map((a) => a.student_id.toString()))];

    // 3. Find students matching direct IDs OR educator clusters
    const query = {
      $or: [],
    };
    if (directStudentIds.length > 0) {
      query.$or.push({ _id: { $in: directStudentIds } });
    }
    if (educatorClusters.length > 0) {
      query.$or.push({ cluster: { $in: educatorClusters } });
    }

    const students = query.$or.length > 0 ? await Student.find(query) : [];

    // Attach latest assessment status to each student
    const studentList = [];
    for (const student of students) {
      const latestAssessment = await Assessment.findOne({ student_id: student._id }).sort({ date: -1 });
      const studentObj = student.toObject();
      studentObj.latest_assessment = latestAssessment || null;
      studentObj.needing_attention = Boolean(latestAssessment && latestAssessment.flagged);
      studentList.push(studentObj);
    }

    res.json({
      educator_id: id,
      total_students: studentList.length,
      clusters: educatorClusters,
      students: studentList,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getEducatorSummary(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Educator ID is required' });
    }

    const sessions = await Session.find({ educator_id: id });
    const sessions_conducted = sessions.length;

    const sessionIds = sessions.map((s) => s._id);
    const clusters = [...new Set(sessions.map((s) => s.cluster).filter(Boolean))];

    // Total average attendance across sessions
    const totalAttendanceCount = sessions.reduce((sum, s) => sum + (s.attendance_count || 0), 0);
    const average_attendance = sessions_conducted > 0 ? Number((totalAttendanceCount / sessions_conducted).toFixed(1)) : 0;

    // Identify reached students
    const attendanceRecords = await SessionAttendance.find({ session_id: { $in: sessionIds } });
    let reachedStudentIds = [...new Set(attendanceRecords.map((a) => a.student_id.toString()))];

    if (reachedStudentIds.length === 0 && clusters.length > 0) {
      const clusterStudents = await Student.find({ cluster: { $in: clusters } }).select('_id');
      reachedStudentIds = clusterStudents.map((s) => s._id.toString());
    }

    const students_reached = reachedStudentIds.length;

    // Calculate students needing attention & students improving among reached students
    let students_needing_attention = 0;
    let students_improving = 0;

    for (const studentId of reachedStudentIds) {
      const assessments = await Assessment.find({ student_id: studentId }).sort({ date: -1 });
      if (assessments.length > 0 && assessments[0].flagged) {
        students_needing_attention++;
      }
      if (assessments.length >= 2) {
        const latest = assessments[0].score;
        const prev = assessments[1].score;
        if (latest > prev) {
          students_improving++;
        }
      }
    }

    res.json({
      educator_id: id,
      sessions_conducted,
      students_reached,
      students_needing_attention,
      average_attendance,
      students_improving,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getEducatorStudents, getEducatorSummary };
