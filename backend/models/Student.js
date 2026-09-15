const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade: { type: Number },
    district: { type: String },
    cluster: { type: String },
    language_pref: { type: String, default: 'ta' },
    guardian_name: { type: String },
    guardian_contact: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.index({ cluster: 1 });
studentSchema.index({ district: 1 });
studentSchema.index({ grade: 1 });

// Virtual alias for backwards compatibility
studentSchema.virtual('language').get(function () {
  return this.language_pref;
});

module.exports = mongoose.model('Student', studentSchema);
