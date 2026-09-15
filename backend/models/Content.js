const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    original_text: { type: String, required: true },
    language: { type: String, default: 'en' },
    localized_text: {
      type: Map,
      of: String,
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
