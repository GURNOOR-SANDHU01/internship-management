/*
  @author Gurnoor SINGH (102316101) 
*/
const express = require('express');
const router = express.Router();
const {
  getMyInterns, updateInternProgress,
  getTasks, createTask, updateTask, deleteTask,
  submitFeedback
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('mentor'));

router.get('/interns', getMyInterns);
router.put('/interns/:id', updateInternProgress);

router.route('/tasks')
  .get(getTasks)
  .post(createTask);

router.route('/tasks/:id')
  .put(updateTask)
  .delete(deleteTask);

router.post('/feedback/:assignmentId', submitFeedback);

module.exports = router;
