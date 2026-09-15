const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true },
    educator_id: { type: String, default: 'ED-101' },
    sender: { type: String, enum: ['student', 'educator', 'assistant'], required: true },
    sender_name: { type: String, required: true },
    text: { type: String, required: true },
    language: { type: String, default: 'en' },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
