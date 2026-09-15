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
    quiz: [
      {
        question: { type: String, required: true },
        options: {
          type: [String],
          validate: {
            validator: (v) => Array.isArray(v) && v.length === 4,
            message: 'options must have exactly 4 entries',
          },
        },
        correct_index: { type: Number, required: true, min: 0, max: 3 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
