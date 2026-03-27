const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toolType: {
      type: String,
      required: true,
      enum: [
        'code-review',
        'bug-detect',
        'security-scan',
        'performance',
        'code-quality',
        'architecture',
        'github-analyze',
        'debug',
        'explain',
      ],
    },
    inputCode: {
      type: String,
      required: true,
    },
    aiResponse: {
      type: String,
      required: true,
    },
    score: {
      readability: { type: Number, default: null },
      maintainability: { type: Number, default: null },
      complexity: { type: Number, default: null },
      security: { type: Number, default: null },
      performance: { type: Number, default: null },
      overall: { type: Number, default: null },
    },
    language: {
      type: String,
      default: 'unknown',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
