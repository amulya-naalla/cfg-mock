const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    educator_id: { type: String, required: true },
    cluster: { type: String, required: true },
    topic: { type: String, required: true },
    attendance_count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
