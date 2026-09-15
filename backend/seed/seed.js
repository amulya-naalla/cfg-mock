require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Content = require('../models/Content');

async function seed() {
  await connectDB();

  await Student.deleteMany({});
  await Assessment.deleteMany({});
  await Content.deleteMany({});

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

  await Content.insertMany([
    {
      title: 'Introduction to Fractions',
      original_text:
        'A fraction represents a part of a whole, written as a numerator over a denominator.',
      language: 'en',
      variants: {
        fast: 'A fraction is part of a whole.',
        medium:
          'A fraction represents a part of a whole, written as a numerator over a denominator.',
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
    },
    {
      title: 'Reading Comprehension Basics',
      original_text:
        'Reading comprehension is the ability to understand and interpret what you read.',
      language: 'en',
    },
  ]);

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
