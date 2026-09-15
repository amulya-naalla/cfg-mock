const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade_level: { type: Number },
    original_text: { type: String, required: true },
    localized_text: {
      type: Object,
      default: {},
    },
    variants: {
      fast: { type: String },
      medium: { type: String },
      slow: { type: String },
    },
    steps: [
      {
        id: { type: String, required: true },
        depth: { type: Number, required: true },
        text: { type: String, required: true },
        parent_id: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
