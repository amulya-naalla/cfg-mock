require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Content = require('../models/Content');
const Session = require('../models/Session');
const SessionAttendance = require('../models/SessionAttendance');
const Intervention = require('../models/Intervention');
const StudentNote = require('../models/StudentNote');
const { FLAG_THRESHOLD_DIFF } = require('../controllers/assessmentController');

async function seed() {
  await connectDB();

  console.log('Clearing existing database collections...');
  await Student.deleteMany({});
  await Assessment.deleteMany({});
  await Content.deleteMany({});
  await Session.deleteMany({});
  await SessionAttendance.deleteMany({});
  await Intervention.deleteMany({});
  await StudentNote.deleteMany({});

  console.log('Seeding 12 Tamil Nadu students...');
  const students = await Student.insertMany([
    {
      name: 'Kavya Selvam',
      grade: 5,
      district: 'Chennai',
      cluster: 'Chennai-North',
      language_pref: 'ta',
      guardian_name: 'Selvam Ramasamy',
      guardian_contact: '+91 98765 43210',
    },
    {
      name: 'Arun Kumar', // Persona 3: Poor attendance student
      grade: 4,
      district: 'Chennai',
      cluster: 'Chennai-North',
      language_pref: 'ta',
      guardian_name: 'Lakshmi Kumar',
      guardian_contact: '+91 98765 43211',
    },
    {
      name: 'Deepa Sundaram', // Persona 1: Improving student
      grade: 6,
      district: 'Chennai',
      cluster: 'Chennai-South',
      language_pref: 'en',
      guardian_name: 'Sundaram Natarajan',
      guardian_contact: '+91 98765 43212',
    },
    {
      name: 'Vijay Chandran', // Persona 2: Persistent learning gap
      grade: 3,
      district: 'Madurai',
      cluster: 'Madurai-East',
      language_pref: 'ta',
      guardian_name: 'Chandran Muthu',
      guardian_contact: '+91 98765 43213',
    },
    {
      name: 'Ananya Ramesh',
      grade: 5,
      district: 'Madurai',
      cluster: 'Madurai-East',
      language_pref: 'ta',
      guardian_name: 'Ramesh Krishnan',
      guardian_contact: '+91 98765 43214',
    },
    {
      name: 'Manoj Pandian', // Persona 4: Received intervention & improved
      grade: 7,
      district: 'Madurai',
      cluster: 'Madurai-West',
      language_pref: 'ta',
      guardian_name: 'Pandian Perumal',
      guardian_contact: '+91 98765 43215',
    },
    {
      name: 'Nithya Murugan',
      grade: 4,
      district: 'Coimbatore',
      cluster: 'Coimbatore-Central',
      language_pref: 'ta',
      guardian_name: 'Murugan Palanisamy',
      guardian_contact: '+91 98765 43216',
    },
    {
      name: 'Suresh Balaji',
      grade: 6,
      district: 'Coimbatore',
      cluster: 'Coimbatore-Central',
      language_pref: 'en',
      guardian_name: 'Balaji Subramanian',
      guardian_contact: '+91 98765 43217',
    },
    {
      name: 'Meenakshi Rajan',
      grade: 8,
      district: 'Coimbatore',
      cluster: 'Coimbatore-South',
      language_pref: 'ta',
      guardian_name: 'Rajan Velu',
      guardian_contact: '+91 98765 43218',
    },
    {
      name: 'Karthik Subramani',
      grade: 3,
      district: 'Chennai',
      cluster: 'Chennai-South',
      language_pref: 'ta',
      guardian_name: 'Subramani Ganesan',
      guardian_contact: '+91 98765 43219',
    },
    {
      name: 'Divya Venkatesh',
      grade: 5,
      district: 'Madurai',
      cluster: 'Madurai-West',
      language_pref: 'en',
      guardian_name: 'Venkatesh Babu',
      guardian_contact: '+91 98765 43220',
    },
    {
      name: 'Saravanan Thanigai',
      grade: 7,
      district: 'Coimbatore',
      cluster: 'Coimbatore-South',
      language_pref: 'ta',
      guardian_name: 'Thanigai Mani',
      guardian_contact: '+91 98765 43221',
    },
  ]);

  console.log(`Seeded ${students.length} students.`);

  // Function to create assessment payload with accurate flagging rule
  const createAssessPayload = (studentIndex, subject, score, gradeExpected, cluster, daysAgo) => {
    const student = students[studentIndex];
    const isFlagged = score < (gradeExpected - (FLAG_THRESHOLD_DIFF || 15));
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
      student_id: student._id,
      subject,
      score,
      grade_level_expected: gradeExpected,
      cluster: cluster || student.cluster,
      date,
      flagged: isFlagged,
    };
  };

  console.log('Seeding realistic assessments...');
  const assessments = await Assessment.insertMany([
    // Student 0: Kavya (Grade 5)
    createAssessPayload(0, 'Math', 78, 60, 'Chennai-North', 10),
    createAssessPayload(0, 'Reading', 42, 60, 'Chennai-North', 2), // Flagged (42 < 45)

    // Student 1: Arun (Grade 4 - Poor attendance)
    createAssessPayload(1, 'Math', 35, 55, 'Chennai-North', 15), // Flagged
    createAssessPayload(1, 'Tamil', 48, 55, 'Chennai-North', 2),

    // Student 2: Deepa (Grade 6 - Persona 1: Improving student 45 -> 68 -> 85)
    createAssessPayload(2, 'English', 45, 70, 'Chennai-South', 30),
    createAssessPayload(2, 'English', 68, 70, 'Chennai-South', 15),
    createAssessPayload(2, 'English', 85, 70, 'Chennai-South', 2),
    createAssessPayload(2, 'Science', 72, 70, 'Chennai-South', 3),

    // Student 3: Vijay (Grade 3 - Persona 2: Persistent learning gap)
    createAssessPayload(3, 'Math', 25, 50, 'Madurai-East', 20), // Flagged
    createAssessPayload(3, 'Math', 28, 50, 'Madurai-East', 10), // Flagged
    createAssessPayload(3, 'Reading', 30, 50, 'Madurai-East', 2), // Flagged

    // Student 4: Ananya (Grade 5)
    createAssessPayload(4, 'Tamil', 80, 65, 'Madurai-East', 7),
    createAssessPayload(4, 'Math', 62, 65, 'Madurai-East', 2),

    // Student 5: Manoj (Grade 7 - Persona 4: Intervention & Improved 40 -> 75)
    createAssessPayload(5, 'Science', 40, 75, 'Madurai-West', 25), // Flagged initial
    createAssessPayload(5, 'Science', 75, 75, 'Madurai-West', 3), // Improved after intervention

    // Student 6: Nithya (Grade 4)
    createAssessPayload(6, 'Math', 65, 55, 'Coimbatore-Central', 9),
    createAssessPayload(6, 'English', 38, 55, 'Coimbatore-Central', 3), // Flagged

    // Student 7: Suresh (Grade 6)
    createAssessPayload(7, 'Science', 88, 70, 'Coimbatore-Central', 11),
    createAssessPayload(7, 'Math', 76, 70, 'Coimbatore-Central', 4),

    // Student 8: Meenakshi (Grade 8)
    createAssessPayload(8, 'Tamil', 92, 80, 'Coimbatore-South', 15),
    createAssessPayload(8, 'Math', 58, 80, 'Coimbatore-South', 5), // Flagged

    // Student 9: Karthik (Grade 3)
    createAssessPayload(9, 'Reading', 60, 50, 'Chennai-South', 6),

    // Student 10: Divya (Grade 5)
    createAssessPayload(10, 'English', 74, 65, 'Madurai-West', 4),

    // Student 11: Saravanan (Grade 7)
    createAssessPayload(11, 'Science', 45, 75, 'Coimbatore-South', 3), // Flagged
  ]);

  console.log(`Seeded ${assessments.length} assessments.`);

  console.log('Seeding 6 educator/volunteer sessions...');
  const sessions = await Session.insertMany([
    {
      educator_id: 'ED-101',
      cluster: 'Chennai-North',
      topic: 'Math Basics & Fractions',
      attendance_count: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    },
    {
      educator_id: 'ED-101',
      cluster: 'Chennai-North',
      topic: 'Reading Circle & Tamil Storytelling',
      attendance_count: 1,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      educator_id: 'ED-102',
      cluster: 'Madurai-East',
      topic: 'Foundational Numeracy & Multiplication Worksheets',
      attendance_count: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    },
    {
      educator_id: 'ED-102',
      cluster: 'Madurai-West',
      topic: 'Science Experiments & Life Skills',
      attendance_count: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
    {
      educator_id: 'ED-103',
      cluster: 'Coimbatore-Central',
      topic: 'English Phonics & Listening Skills',
      attendance_count: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
    {
      educator_id: 'ED-103',
      cluster: 'Coimbatore-South',
      topic: 'Hygiene, Health & Environmental Science',
      attendance_count: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ]);

  console.log(`Seeded ${sessions.length} sessions.`);

  console.log('Seeding individual session attendance records...');
  const attendanceRecords = await SessionAttendance.insertMany([
    // Session 0 (Chennai-North)
    { session_id: sessions[0]._id, student_id: students[0]._id, status: 'present' }, // Kavya
    { session_id: sessions[0]._id, student_id: students[1]._id, status: 'absent' },  // Arun (Absent - Persona 3)

    // Session 1 (Chennai-North)
    { session_id: sessions[1]._id, student_id: students[0]._id, status: 'present' }, // Kavya
    { session_id: sessions[1]._id, student_id: students[1]._id, status: 'absent' },  // Arun (Absent - Persona 3)

    // Session 2 (Madurai-East)
    { session_id: sessions[2]._id, student_id: students[3]._id, status: 'present' }, // Vijay
    { session_id: sessions[2]._id, student_id: students[4]._id, status: 'present' }, // Ananya

    // Session 3 (Madurai-West)
    { session_id: sessions[3]._id, student_id: students[5]._id, status: 'present' }, // Manoj
    { session_id: sessions[3]._id, student_id: students[10]._id, status: 'present' },// Divya

    // Session 4 (Coimbatore-Central)
    { session_id: sessions[4]._id, student_id: students[6]._id, status: 'present' }, // Nithya
    { session_id: sessions[4]._id, student_id: students[7]._id, status: 'present' }, // Suresh

    // Session 5 (Coimbatore-South)
    { session_id: sessions[5]._id, student_id: students[8]._id, status: 'present' }, // Meenakshi
    { session_id: sessions[5]._id, student_id: students[11]._id, status: 'present' },// Saravanan
  ]);

  console.log(`Seeded ${attendanceRecords.length} attendance records.`);

  console.log('Seeding interventions...');
  const interventions = await Intervention.insertMany([
    {
      student_id: students[3]._id, // Vijay (Persona 2: Persistent gap)
      educator_id: 'ED-102',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
      subject: 'Math',
      issue: 'Struggles with single-digit addition and place value recognition',
      action: 'Provide visual block counters and 1-on-1 15-min remedial after session',
      status: 'active',
      notes: 'Needs repeated practice on place values.',
    },
    {
      student_id: students[5]._id, // Manoj (Persona 4: Intervention & Improved)
      educator_id: 'ED-102',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      subject: 'Science',
      issue: 'Scored 40 on Science baseline assessment',
      action: 'Conduct hands-on experiment demonstration on force and motion',
      status: 'completed',
      notes: 'Student responded exceptionally well to visual demonstrations. Score improved to 75!',
    },
    {
      student_id: students[1]._id, // Arun (Persona 3: Poor attendance)
      educator_id: 'ED-101',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      subject: 'Attendance',
      issue: 'Missed consecutive weekend learning sessions',
      action: 'Schedule home visit with guardian Lakshmi Kumar',
      status: 'planned',
      notes: 'Guardian works morning shift; coordinate evening check-in.',
    },
  ]);

  console.log(`Seeded ${interventions.length} interventions.`);

  console.log('Seeding student notes...');
  const studentNotes = await StudentNote.insertMany([
    {
      student_id: students[3]._id, // Vijay
      educator_id: 'ED-102',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
      note: 'Vijay is enthusiastic in group activities but hesitates during written math worksheets.',
    },
    {
      student_id: students[5]._id, // Manoj
      educator_id: 'ED-102',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
      note: 'Manoj shows high curiosity in practical science applications.',
    },
    {
      student_id: students[2]._id, // Deepa
      educator_id: 'ED-101',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      note: 'Deepa has shown rapid progress in English comprehension after borrowing storybooks.',
    },
  ]);

  console.log(`Seeded ${studentNotes.length} student notes.`);

  console.log('Seeding 2 content lessons...');
  const content = await Content.insertMany([
    {
      title: 'Introduction to Fractions',
      subject: 'Math',
      grade_level: 5,
      original_text: 'A fraction represents a part of a whole. It has a numerator and a denominator.',
    },
    {
      title: 'Reading Comprehension Basics',
      subject: 'Reading',
      grade_level: 6,
      original_text: 'Reading comprehension means understanding what you read and being able to explain it.',
    },
  ]);
  console.log(`Seeded ${content.length} content lessons.`);

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
