const mongoose = require('mongoose');

const studentNoteSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    educator_id: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, required: true },
  },
  { timestamps: true }
);

studentNoteSchema.index({ student_id: 1, date: -1 });

module.exports = mongoose.model('StudentNote', studentNoteSchema);
