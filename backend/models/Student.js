const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade_level: { type: Number },
    language_pref: { type: String, default: 'en' },
    district: { type: String },
    cluster: { type: String },
    guardian_name: { type: String },
    guardian_contact: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
