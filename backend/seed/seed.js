require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Content = require('../models/Content');
const Session = require('../models/Session');

async function seed() {
  await connectDB();

  await Student.deleteMany({});
  await Assessment.deleteMany({});
  await Content.deleteMany({});
  await Session.deleteMany({});

  const students = await Student.insertMany([
    { name: 'Aarav Sharma', grade_level: 5, language_pref: 'hi' },
    { name: 'Meera Iyer', grade_level: 6, language_pref: 'ta' },
    { name: 'Rahul Verma', grade_level: 5, language_pref: 'en' },
  ]);

  await Assessment.insertMany([
    { student_id: students[0]._id, subject: 'Math', score: 72, cluster: 'fractions' },
    { student_id: students[1]._id, subject: 'Reading', score: 45, cluster: 'comprehension', flagged: true },
    { student_id: students[2]._id, subject: 'Math', score: 88, cluster: 'geometry' },
  ]);

  // 2 seed lessons — original_text only, localized_text gets filled by hitting the translate route.
  await Content.insertMany([
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

  // Disposable mock seed for Backend 1's collection — remove once real sessions data is live.
  await Session.insertMany([
    { cluster: 'fractions', topic: 'Adding fractions', date: new Date('2026-09-10'), attendance_count: 8 },
    { cluster: 'comprehension', topic: 'Main idea practice', date: new Date('2026-09-12'), attendance_count: 6 },
    { cluster: 'geometry', topic: 'Shapes and angles', date: new Date('2026-09-13'), attendance_count: 7 },
  ]);

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
