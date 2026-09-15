const mongoose = require('mongoose');

const sessionAttendanceSchema = new mongoose.Schema(
  {
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
      default: 'present',
    },
    recorded_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate attendance records for same session + student
sessionAttendanceSchema.index({ session_id: 1, student_id: 1 }, { unique: true });
sessionAttendanceSchema.index({ student_id: 1 });

module.exports = mongoose.model('SessionAttendance', sessionAttendanceSchema);
