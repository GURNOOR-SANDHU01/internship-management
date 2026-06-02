const express = require('express');
const router = express.Router();
const { getAllUsers, getStats, updateUserRole, deleteUser, getAllInternships } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.get('/internships', getAllInternships);

module.exports = router;
