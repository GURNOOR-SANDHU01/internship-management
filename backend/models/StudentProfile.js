/*
  @author Gurnoor SINGH (102316101) 
*/
const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  phone: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  education: [
    {
      institution: String,
      degree: String,
      year: String,
    }
  ],
  projects: [
    {
      title: String,
      description: String,
      link: String,
    }
  ],
  github: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  resumeUrl: {
    type: String,
  },
  experience: [
    {
      company: String,
      role: String,
      duration: String,
      description: String,
    }
  ]
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
