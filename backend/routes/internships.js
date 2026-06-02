const express = require('express');
const router = express.Router();
const { getInternships, createInternship, getMyInternships, updateInternship, deleteInternship } = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getInternships)
  .post(protect, authorize('recruiter', 'admin'), createInternship);

router.route('/me')
  .get(protect, authorize('recruiter'), getMyInternships);

router.route('/:id')
  .put(protect, authorize('recruiter', 'admin'), updateInternship)
  .delete(protect, authorize('recruiter', 'admin'), deleteInternship);

module.exports = router;
