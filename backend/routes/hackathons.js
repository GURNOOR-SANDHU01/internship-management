const express = require('express');
const router = express.Router();
const { getHackathons, createHackathon } = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getHackathons)
  .post(protect, authorize('recruiter', 'admin'), createHackathon);

module.exports = router;
