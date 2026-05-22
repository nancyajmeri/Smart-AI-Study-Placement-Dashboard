const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // e.g. "11:00"
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number, // in minutes, auto-calculated or manually set
    },
    status: {
      type: String,
      enum: ['planned', 'completed', 'skipped'],
      default: 'planned',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
