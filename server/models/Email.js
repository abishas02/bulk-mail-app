const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'partial'],
    default: 'sent',
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Email', emailSchema);
