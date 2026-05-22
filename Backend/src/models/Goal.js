const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    targetHours: {
      type: Number,
      required: [true, 'Target hours are required'],
      min: [0.5, 'Target must be at least 30 minutes'],
    },
    completedHours: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
