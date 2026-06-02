/*
  @author Gurnoor SINGH (102316101) 
*/
const Internship = require('../models/Internship');

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res) => {
  try {
    const internships = await Internship.find().populate('recruiter', 'name companyName');
    res.status(200).json(internships);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private (Recruiter)
exports.createInternship = async (req, res) => {
  try {
    const { title, companyName, description, requirements, stipend, location, type } = req.body;
    
    const internship = await Internship.create({
      recruiter: req.user.id,
      title,
      companyName,
      description,
      requirements,
      stipend,
      location,
      type
    });
    
    res.status(201).json(internship);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Get recruiter's internships
// @route   GET /api/internships/me
// @access  Private (Recruiter)
exports.getMyInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ recruiter: req.user.id });
    res.status(200).json(internships);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Recruiter)
exports.updateInternship = async (req, res) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Make sure user owns internship
    if (internship.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this internship' });
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(internship);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Recruiter)
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Make sure user owns internship
    if (internship.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this internship' });
    }

    await internship.deleteOne();

    res.status(200).json({ message: 'Internship removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
