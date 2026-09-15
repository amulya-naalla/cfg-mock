const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    educator_id: { type: String, required: true },
    date: { type: Date, default: Date.now },
    subject: { type: String, required: true },
    issue: { type: String, required: true },
    action: { type: String, required: true },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

interventionSchema.index({ student_id: 1 });
interventionSchema.index({ educator_id: 1 });
interventionSchema.index({ status: 1 });

module.exports = mongoose.model('Intervention', interventionSchema);
