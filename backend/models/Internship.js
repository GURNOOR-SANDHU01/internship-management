/*
  @author Gurnoor SINGH (102316101) 
*/
const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  stipend: {
    type: String,
  },
  location: {
    type: String,
  },
  type: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'Remote',
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Internship', InternshipSchema);
