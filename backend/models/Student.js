const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade: { type: String },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
