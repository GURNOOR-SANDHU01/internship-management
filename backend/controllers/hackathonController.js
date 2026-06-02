/*
  @author Gurnoor SINGH (102316101) 
*/
const Hackathon = require('../models/Hackathon');

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public
exports.getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ date: 1 });
    res.status(200).json(hackathons);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Create new hackathon
// @route   POST /api/hackathons
// @access  Private (Admin or Recruiter)
exports.createHackathon = async (req, res) => {
  try {
    const { title, description, organizer, date, registrationLink, tags } = req.body;
    
    const hackathon = await Hackathon.create({
      title,
      description,
      organizer,
      date,
      registrationLink,
      tags
    });
    
    res.status(201).json(hackathon);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
