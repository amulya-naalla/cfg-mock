const mongoose = require('mongoose');

// Read-only shape for Backend 1's `sessions` collection — confirm field names with them.
const sessionSchema = new mongoose.Schema(
  {
    cluster: { type: String },
    topic: { type: String },
    date: { type: Date },
    attendance_count: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
