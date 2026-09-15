const mongoose = require('mongoose');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const SessionAttendance = require('../models/SessionAttendance');
const Intervention = require('../models/Intervention');
const StudentNote = require('../models/StudentNote');

// Helper to compute assessment trend for a student
async function calculateTrendData(studentId) {
  const assessments = await Assessment.find({ student_id: studentId }).sort({ date: -1 });

  if (!assessments || assessments.length === 0) {
    return {
      latest_score: null,
      previous_score: null,
      improvement: null,
      average_score: null,
      trend: 'insufficient_data',
    };
  }

  const latest_score = assessments[0].score;
  const average_score = Number(
    (assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length).toFixed(1)
  );

  if (assessments.length === 1) {
    return {
      latest_score,
      previous_score: null,
      improvement: null,
      average_score,
      trend: 'insufficient_data',
    };
  }

  const previous_score = assessments[1].score;
  const improvement = latest_score - previous_score;

  let trend = 'stable';
  if (improvement > 3) trend = 'improving';
  else if (improvement < -3) trend = 'declining';

  return {
    latest_score,
    previous_score,
    improvement,
    average_score,
    trend,
  };
}

// Helper to compute attendance percentage
async function calculateAttendanceData(studentId) {
  const records = await SessionAttendance.find({ student_id: studentId });
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

  return {
    total_sessions,
    present,
    absent,
    late,
    attendance_percentage,
  };
}

// Helper to compute rule-based status and reasons
async function calculateStatusData(studentId) {
  const latestAssessment = await Assessment.findOne({ student_id: studentId }).sort({ date: -1 });
  const trendData = await calculateTrendData(studentId);
  const attendanceData = await calculateAttendanceData(studentId);
  const activeInterventions = await Intervention.find({ student_id: studentId, status: 'active' });

  const reasons = [];

  // Evaluate assessment gap
  let isFlagged = false;
  let gap = 0;
  if (latestAssessment) {
    isFlagged = latestAssessment.flagged;
    gap = (latestAssessment.grade_level_expected || 60) - latestAssessment.score;
  }

  if (isFlagged || gap >= 15) {
    reasons.push(`${latestAssessment.subject || 'Subject'} score (${latestAssessment.score}) is significantly below expected level (${latestAssessment.grade_level_expected})`);
  }

  if (trendData.trend === 'declining') {
    reasons.push(`Assessment scores are declining (recent drop of ${Math.abs(trendData.improvement)} points)`);
  }

  if (attendanceData.total_sessions >= 2 && attendanceData.attendance_percentage < 70) {
    reasons.push(`Attendance rate is low (${attendanceData.attendance_percentage}%)`);
  }

  if (activeInterventions.length > 0) {
    reasons.push(`Student currently has ${activeInterventions.length} active targeted intervention(s)`);
  }

  let status = 'ON_TRACK';
  if (isFlagged || gap >= 20 || activeInterventions.length >= 2 || (trendData.trend === 'declining' && attendanceData.attendance_percentage < 60)) {
    status = 'NEEDS_INTERVENTION';
  } else if (gap > 5 || trendData.trend === 'declining' || attendanceData.attendance_percentage < 85 || activeInterventions.length === 1) {
    status = 'NEEDS_MONITORING';
  }

  if (reasons.length === 0) {
    reasons.push('Student is performing at or above expected grade level with consistent attendance.');
  }

  return {
    status,
    reasons,
  };
}

// Helper to compute rule-based recommendations
async function calculateRecommendationsData(studentId) {
  const assessments = await Assessment.find({ student_id: studentId }).sort({ date: -1 });
  const attendanceData = await calculateAttendanceData(studentId);
  const recommendations = [];

  for (const assess of assessments) {
    const gap = assess.grade_level_expected - assess.score;
    if (gap > 10) {
      const subject = assess.subject;
      let recText = `Provide supplementary foundational exercises in ${subject}`;
      if (subject.toLowerCase().includes('read') || subject.toLowerCase().includes('tamil') || subject.toLowerCase().includes('english')) {
        recText = 'Enroll in Reading Circle & guided vocabulary practice';
      } else if (subject.toLowerCase().includes('math')) {
        recText = 'Focus on Math Basics, arithmetic drills & conceptual problem solving';
      } else if (subject.toLowerCase().includes('science')) {
        recText = 'Conduct hands-on experiment demonstrations & visual learning workshops';
      }

      recommendations.push({
        subject,
        reason: `${subject} score (${assess.score}) is ${gap} points below expected grade level (${assess.grade_level_expected})`,
        recommendation: recText,
        priority: gap >= 20 ? 'high' : 'medium',
      });
    }
  }

  if (attendanceData.total_sessions >= 2 && attendanceData.attendance_percentage < 75) {
    recommendations.push({
      subject: 'Attendance & Engagement',
      reason: `Low attendance rate of ${attendanceData.attendance_percentage}%`,
      recommendation: 'Conduct guardian outreach visit and coordinate community volunteer transport',
      priority: 'high',
    });
  }

  return recommendations;
}

// ------------------- CONTROLLER METHODS -------------------

async function getAssessmentTrend(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const trendData = await calculateTrendData(id);
    res.json({
      student_id: id,
      ...trendData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentProgressTimeline(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const assessments = await Assessment.find({ student_id: id });
    const attendanceRecords = await SessionAttendance.find({ student_id: id }).populate('session_id');
    const interventions = await Intervention.find({ student_id: id });
    const notes = await StudentNote.find({ student_id: id });

    const timeline = [];

    for (const a of assessments) {
      timeline.push({
        date: a.date,
        type: 'assessment',
        subject: a.subject,
        score: a.score,
        grade_level_expected: a.grade_level_expected,
        flagged: a.flagged,
      });
    }

    for (const att of attendanceRecords) {
      if (att.session_id) {
        timeline.push({
          date: att.recorded_at || att.session_id.date,
          type: 'session',
          topic: att.session_id.topic,
          cluster: att.session_id.cluster,
          status: att.status,
        });
      }
    }

    for (const inv of interventions) {
      timeline.push({
        date: inv.date,
        type: 'intervention',
        subject: inv.subject,
        issue: inv.issue,
        action: inv.action,
        status: inv.status,
      });
    }

    for (const n of notes) {
      timeline.push({
        date: n.date,
        type: 'note',
        educator_id: n.educator_id,
        note: n.note,
      });
    }

    // Sort timeline chronologically descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      student,
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentsNeedingAttention(req, res) {
  try {
    const { cluster, district, grade, subject } = req.query;

    // Filter students first
    const studentFilter = {};
    if (cluster) studentFilter.cluster = cluster;
    if (district) studentFilter.district = district;
    if (grade) studentFilter.grade = Number(grade);

    const students = await Student.find(studentFilter);
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    const assessmentFilter = {
      student_id: { $in: Array.from(studentMap.keys()) },
    };
    if (subject) assessmentFilter.subject = subject;

    const assessments = await Assessment.find(assessmentFilter).sort({ date: -1 });

    // Group by student to evaluate their latest assessment
    const latestAssessmentsByStudent = new Map();
    for (const a of assessments) {
      const sId = a.student_id.toString();
      if (!latestAssessmentsByStudent.has(sId)) {
        latestAssessmentsByStudent.set(sId, a);
      }
    }

    const attentionList = [];
    for (const [sId, assessment] of latestAssessmentsByStudent.entries()) {
      if (assessment.flagged) {
        const student = studentMap.get(sId);
        if (student) {
          const expected = assessment.grade_level_expected || 60;
          const gap = expected - assessment.score;
          attentionList.push({
            student_id: student._id,
            name: student.name,
            grade: student.grade,
            district: student.district,
            cluster: student.cluster,
            subject: assessment.subject,
            score: assessment.score,
            expected_score: expected,
            gap,
            flagged: assessment.flagged,
          });
        }
      }
    }

    // Sort by largest gap first
    attentionList.sort((a, b) => b.gap - a.gap);

    res.json(attentionList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentStatusEndpoint(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const statusData = await calculateStatusData(id);
    res.json({
      student_id: id,
      ...statusData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentRecommendationsEndpoint(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const recommendations = await calculateRecommendationsData(id);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudent360(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Parallel execution for optimal performance
    const [trendData, attendanceData, statusData, interventions, notes, recommendations, progressData] =
      await Promise.all([
        calculateTrendData(id),
        calculateAttendanceData(id),
        calculateStatusData(id),
        Intervention.find({ student_id: id }).sort({ date: -1 }),
        StudentNote.find({ student_id: id }).sort({ date: -1 }),
        calculateRecommendationsData(id),
        Assessment.find({ student_id: id }).sort({ date: -1 }),
      ]);

    const assessment_summary = {
      total_assessments: progressData.length,
      latest_score: trendData.latest_score,
      previous_score: trendData.previous_score,
      average_score: trendData.average_score,
      trend: trendData.trend,
    };

    // Timeline construction
    const attendanceRecords = await SessionAttendance.find({ student_id: id }).populate('session_id');
    const timeline = [];

    for (const a of progressData) {
      timeline.push({
        date: a.date,
        type: 'assessment',
        subject: a.subject,
        score: a.score,
        flagged: a.flagged,
      });
    }
    for (const att of attendanceRecords) {
      if (att.session_id) {
        timeline.push({
          date: att.recorded_at || att.session_id.date,
          type: 'session',
          topic: att.session_id.topic,
          status: att.status,
        });
      }
    }
    for (const inv of interventions) {
      timeline.push({
        date: inv.date,
        type: 'intervention',
        subject: inv.subject,
        action: inv.action,
        status: inv.status,
      });
    }
    for (const n of notes) {
      timeline.push({
        date: n.date,
        type: 'note',
        note: n.note,
      });
    }
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      student,
      assessment_summary,
      attendance: attendanceData,
      status: statusData,
      interventions,
      notes,
      recommendations,
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAssessmentTrend,
  getStudentProgressTimeline,
  getStudentsNeedingAttention,
  getStudentStatusEndpoint,
  getStudentRecommendationsEndpoint,
  getStudent360,
};
