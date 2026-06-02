const mongoose = require('mongoose');

const RecruiterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
  },
  website: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  }
});

module.exports = mongoose.model('RecruiterProfile', RecruiterProfileSchema);
