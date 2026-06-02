/*
  @author Gurnoor SINGH (102316101) 
*/
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  resumeUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Applied', 'Pending', 'Shortlisted', 'Interview', 'Hired', 'Rejected'],
    default: 'Applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
