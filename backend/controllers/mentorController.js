/*
  @author Gurnoor SINGH (102316101) 
*/
const MentorAssignment = require('../models/MentorAssignment');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get mentor's assigned interns
// @route   GET /api/mentor/interns
// @access  Private (Mentor)
exports.getMyInterns = async (req, res) => {
  try {
    const assignments = await MentorAssignment.find({ mentor: req.user.id })
      .populate('intern', 'name email');
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update intern progress / attendance
// @route   PUT /api/mentor/interns/:id
// @access  Private (Mentor)
exports.updateInternProgress = async (req, res) => {
  try {
    const assignment = await MentorAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.mentor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { progress, attendance } = req.body;
    if (progress !== undefined) assignment.progress = progress;
    if (attendance !== undefined) assignment.attendance = attendance;
    await assignment.save();

    res.status(200).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Get all tasks for mentor's interns
// @route   GET /api/mentor/tasks
// @access  Private (Mentor)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ mentor: req.user.id })
      .populate('intern', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Create a task
// @route   POST /api/mentor/tasks
// @access  Private (Mentor)
exports.createTask = async (req, res) => {
  try {
    const { intern, title, description, priority, dueDate } = req.body;
    const task = await Task.create({
      mentor: req.user.id,
      intern,
      title,
      description,
      priority,
      dueDate,
    });
    const populated = await task.populate('intern', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/mentor/tasks/:id
// @access  Private (Mentor)
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.mentor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('intern', 'name email');

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/mentor/tasks/:id
// @access  Private (Mentor)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.mentor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Submit feedback for an intern
// @route   POST /api/mentor/feedback/:assignmentId
// @access  Private (Mentor)
exports.submitFeedback = async (req, res) => {
  try {
    const assignment = await MentorAssignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.mentor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { text, rating } = req.body;
    assignment.feedback.push({ text, rating });
    await assignment.save();

    res.status(200).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
