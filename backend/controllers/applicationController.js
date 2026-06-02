/*
  @author Gurnoor SINGH (102316101) 
*/
const Application = require('../models/Application');
const Internship = require('../models/Internship');

// @desc    Apply for an internship
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForInternship = async (req, res) => {
  try {
    const { internshipId, resumeUrl } = req.body;

    // Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      student: req.user.id,
      internship: internshipId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this internship' });
    }

    const application = await Application.create({
      student: req.user.id,
      internship: internshipId,
      resumeUrl
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/me
// @access  Private (Student)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('internship', 'title companyName location type status');
      
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Get applications for an internship
// @route   GET /api/applications/internship/:id
// @access  Private (Recruiter)
exports.getInternshipApplications = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Ensure the requester is the recruiter who posted it
    if (internship.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ internship: req.params.id })
      .populate('student', 'name email');
      
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Get all applications for a recruiter's internships
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter)
exports.getRecruiterApplications = async (req, res) => {
  try {
    const internships = await Internship.find({ recruiter: req.user.id }).select('_id');
    const internshipIds = internships.map(i => i._id);

    const applications = await Application.find({ internship: { $in: internshipIds } })
      .populate('student', 'name email')
      .populate('internship', 'title');
      
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let application = await Application.findById(req.params.id).populate('internship');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only allow the recruiter who posted the internship to update status, or an admin
    if (application.internship.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
