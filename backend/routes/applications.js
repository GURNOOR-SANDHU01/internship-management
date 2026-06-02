/*
  @author Gurnoor SINGH (102316101) 
*/
const express = require('express');
const router = express.Router();
const { applyForInternship, getMyApplications, getInternshipApplications, getRecruiterApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('student'), applyForInternship);

router.route('/me')
  .get(protect, authorize('student'), getMyApplications);

router.route('/recruiter')
  .get(protect, authorize('recruiter'), getRecruiterApplications);

router.route('/internship/:id')
  .get(protect, authorize('recruiter', 'admin'), getInternshipApplications);

router.route('/:id/status')
  .put(protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
