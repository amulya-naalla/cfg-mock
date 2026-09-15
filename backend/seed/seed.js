require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Content = require('../models/Content');
const Session = require('../models/Session');
const { FLAG_THRESHOLD_DIFF } = require('../controllers/assessmentController');

async function seed() {
  await connectDB();

  console.log('Clearing existing database collections...');
  await Student.deleteMany({});
  await Assessment.deleteMany({});
  await Content.deleteMany({});
  await Session.deleteMany({});

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
      name: 'Arun Kumar',
      grade: 4,
      district: 'Chennai',
      cluster: 'Chennai-North',
      language_pref: 'ta',
      guardian_name: 'Lakshmi Kumar',
      guardian_contact: '+91 98765 43211',
    },
    {
      name: 'Deepa Sundaram',
      grade: 6,
      district: 'Chennai',
      cluster: 'Chennai-South',
      language_pref: 'en',
      guardian_name: 'Sundaram Natarajan',
      guardian_contact: '+91 98765 43212',
    },
    {
      name: 'Vijay Chandran',
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
      name: 'Manoj Pandian',
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

  console.log('Seeding 20 realistic assessments...');
  const assessments = await Assessment.insertMany([
    // Student 0: Kavya (Grade 5)
    createAssessPayload(0, 'Math', 78, 60, 'Chennai-North', 10),
    createAssessPayload(0, 'Reading', 42, 60, 'Chennai-North', 2), // Flagged (42 < 45)

    // Student 1: Arun (Grade 4)
    createAssessPayload(1, 'Math', 35, 55, 'Chennai-North', 5), // Flagged (35 < 40)
    createAssessPayload(1, 'Tamil', 68, 55, 'Chennai-North', 1),

    // Student 2: Deepa (Grade 6)
    createAssessPayload(2, 'English', 85, 70, 'Chennai-South', 8),
    createAssessPayload(2, 'Science', 72, 70, 'Chennai-South', 3),

    // Student 3: Vijay (Grade 3)
    createAssessPayload(3, 'Math', 25, 50, 'Madurai-East', 12), // Flagged (25 < 35)
    createAssessPayload(3, 'Reading', 30, 50, 'Madurai-East', 4), // Flagged (30 < 35)

    // Student 4: Ananya (Grade 5)
    createAssessPayload(4, 'Tamil', 80, 65, 'Madurai-East', 7),
    createAssessPayload(4, 'Math', 62, 65, 'Madurai-East', 2),

    // Student 5: Manoj (Grade 7)
    createAssessPayload(5, 'Science', 40, 75, 'Madurai-West', 14), // Flagged (40 < 60)
    createAssessPayload(5, 'Math', 70, 75, 'Madurai-West', 6),

    // Student 6: Nithya (Grade 4)
    createAssessPayload(6, 'Math', 65, 55, 'Coimbatore-Central', 9),
    createAssessPayload(6, 'English', 38, 55, 'Coimbatore-Central', 3), // Flagged (38 < 40)

    // Student 7: Suresh (Grade 6)
    createAssessPayload(7, 'Science', 88, 70, 'Coimbatore-Central', 11),
    createAssessPayload(7, 'Math', 76, 70, 'Coimbatore-Central', 4),

    // Student 8: Meenakshi (Grade 8)
    createAssessPayload(8, 'Tamil', 92, 80, 'Coimbatore-South', 15),
    createAssessPayload(8, 'Math', 58, 80, 'Coimbatore-South', 5), // Flagged (58 < 65)

    // Student 9: Karthik (Grade 3)
    createAssessPayload(9, 'Reading', 60, 50, 'Chennai-South', 6),

    // Student 10: Divya (Grade 5)
    createAssessPayload(10, 'English', 74, 65, 'Madurai-West', 4),

    // Student 11: Saravanan (Grade 7)
    createAssessPayload(11, 'Science', 45, 75, 'Coimbatore-South', 3), // Flagged (45 < 60)
  ]);

  console.log(`Seeded ${assessments.length} assessments.`);

  console.log('Seeding 6 educator/volunteer sessions...');
  const sessions = await Session.insertMany([
    {
      educator_id: 'ED-101',
      cluster: 'Chennai-North',
      topic: 'Math Basics & Fractions',
      attendance_count: 14,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    },
    {
      educator_id: 'ED-101',
      cluster: 'Chennai-North',
      topic: 'Reading Circle & Tamil Storytelling',
      attendance_count: 16,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      educator_id: 'ED-102',
      cluster: 'Madurai-East',
      topic: 'Foundational Numeracy & Multiplication Worksheets',
      attendance_count: 12,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
    {
      educator_id: 'ED-102',
      cluster: 'Madurai-West',
      topic: 'Science Experiments & Life Skills',
      attendance_count: 15,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
    {
      educator_id: 'ED-103',
      cluster: 'Coimbatore-Central',
      topic: 'English Phonics & Listening Skills',
      attendance_count: 18,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
    {
      educator_id: 'ED-103',
      cluster: 'Coimbatore-South',
      topic: 'Hygiene, Health & Environmental Science',
      attendance_count: 11,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ]);

  console.log(`Seeded ${sessions.length} sessions.`);

  console.log('Seeding 2 content lessons...');
  // 2 seed lessons — original_text only, localized_text gets filled by hitting the translate route.
  // Fractions also carries pace variants + a depth-tagged step tree; Reading Comprehension has
  // neither, to exercise the fallback-to-original_text path.
  const content = await Content.insertMany([
    {
      title: 'Introduction to Fractions',
      subject: 'Math',
      grade_level: 5,
      original_text: 'A fraction represents a part of a whole. It has a numerator and a denominator.',
      variants: {
        fast: 'A fraction is part of a whole.',
        medium: 'A fraction represents a part of a whole. It has a numerator and a denominator.',
        slow:
          'A fraction shows a part of a whole. It has two numbers. The top number is called the numerator. The bottom number is called the denominator.',
      },
      steps: [
        { id: '1', depth: 0, text: 'A fraction shows a part of a whole.' },
        { id: '1.1', depth: 1, text: 'The numerator is the top number of a fraction.', parent_id: '1' },
        {
          id: '1.1.1',
          depth: 2,
          text: 'If a pizza has 8 slices and you eat 3, the numerator is 3.',
          parent_id: '1.1',
        },
        { id: '2', depth: 0, text: 'The denominator is the bottom number of a fraction.' },
        {
          id: '2.1',
          depth: 1,
          text: 'The denominator tells you how many equal parts make up the whole.',
          parent_id: '2',
        },
        { id: '3', depth: 0, text: 'You write a fraction as numerator over denominator, like 3/8.' },
        { id: '4', depth: 0, text: 'You read 3/8 aloud as "three eighths".' },
      ],
      quiz: [
        {
          question: 'In the fraction 3/8, what is the numerator?',
          options: ['3', '8', '11', '0'],
          correct_index: 0,
        },
        {
          question: 'What does the denominator tell you?',
          options: [
            'How many parts you have',
            'How many equal parts make up the whole',
            'The name of the fraction',
            'Whether the fraction is big',
          ],
          correct_index: 1,
        },
        {
          question: 'How do you read the fraction 3/8 aloud?',
          options: ['Three eighths', 'Eight thirds', 'Three over eight parts', 'Thirty-eight'],
          correct_index: 0,
        },
      ],
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
