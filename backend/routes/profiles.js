const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.route('/me')
  .get(protect, getMyProfile)
  .put(protect, updateMyProfile);

module.exports = router;
