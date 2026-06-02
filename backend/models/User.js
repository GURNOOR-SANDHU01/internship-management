/*
  @author Gurnoor SINGH (102316101) 
*/
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'admin', 'mentor'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Cascade delete associated data when a user is deleted
UserSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const StudentProfile = require('./StudentProfile');
  const RecruiterProfile = require('./RecruiterProfile');
  const Internship = require('./Internship');
  const Application = require('./Application');
  const MentorAssignment = require('./MentorAssignment');
  const Task = require('./Task');

  if (this.role === 'student') {
    await StudentProfile.deleteOne({ user: this._id });
    await Application.deleteMany({ student: this._id });
    await MentorAssignment.deleteMany({ intern: this._id });
    await Task.deleteMany({ intern: this._id });
  } else if (this.role === 'recruiter') {
    await RecruiterProfile.deleteOne({ user: this._id });
    const internships = await Internship.find({ recruiter: this._id });
    const internshipIds = internships.map(i => i._id);
    await Application.deleteMany({ internship: { $in: internshipIds } });
    await Internship.deleteMany({ recruiter: this._id });
  } else if (this.role === 'mentor') {
    await MentorAssignment.deleteMany({ mentor: this._id });
    await Task.deleteMany({ mentor: this._id });
  }
});

module.exports = mongoose.model('User', UserSchema);
