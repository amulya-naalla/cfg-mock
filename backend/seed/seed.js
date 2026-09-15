require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

async function seed() {
  await connectDB();

  await Student.deleteMany({});
  await Assessment.deleteMany({});

  const students = await Student.insertMany([
    { name: 'Aarav Sharma', grade: '5', language: 'hi' },
    { name: 'Meera Iyer', grade: '6', language: 'ta' },
    { name: 'Rahul Verma', grade: '5', language: 'en' },
  ]);

  await Assessment.insertMany([
    { student_id: students[0]._id, subject: 'Math', score: 72, cluster: 'fractions' },
    { student_id: students[1]._id, subject: 'Reading', score: 45, cluster: 'comprehension', flagged: true },
    { student_id: students[2]._id, subject: 'Math', score: 88, cluster: 'geometry' },
  ]);

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
