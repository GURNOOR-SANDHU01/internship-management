const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

// @desc    Get current user's profile
// @route   GET /api/profiles/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const { role } = req.user;
    let profile;

    if (role === 'student') {
      profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    } else if (role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    } else {
      return res.status(400).json({ message: 'Profile not available for this role' });
    }

    if (!profile) {
      // Return empty profile scaffold
      return res.status(200).json({ user: req.user.id, _empty: true });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profiles/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
  try {
    const { role } = req.user;
    let profile;

    if (role === 'student') {
      profile = await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { ...req.body, user: req.user.id },
        { new: true, upsert: true, runValidators: true }
      );
    } else if (role === 'recruiter') {
      profile = await RecruiterProfile.findOneAndUpdate(
        { user: req.user.id },
        { ...req.body, user: req.user.id },
        { new: true, upsert: true, runValidators: true }
      );
    } else {
      return res.status(400).json({ message: 'Profile not available for this role' });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
