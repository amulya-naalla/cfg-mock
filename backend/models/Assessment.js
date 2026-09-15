const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, default: Date.now },
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    grade_level_expected: { type: Number, required: true },
    cluster: { type: String },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

assessmentSchema.index({ student_id: 1, date: -1 });
assessmentSchema.index({ flagged: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
