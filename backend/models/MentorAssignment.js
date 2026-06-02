/*
  @author Gurnoor SINGH (102316101) 
*/
const mongoose = require('mongoose');

const MentorAssignmentSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  attendance: {
    type: String,
    default: '100%',
  },
  feedback: [
    {
      text: String,
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  startDate: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('MentorAssignment', MentorAssignmentSchema);
