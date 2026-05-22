const { validationResult } = require('express-validator');
const StudySession = require('../models/StudySession');
const Goal = require('../models/Goal');

// ─── STUDY SESSIONS ───────────────────────────────────────────────

// @desc    Get all sessions for the logged-in user
// @route   GET /api/planner/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { status, subject, from, to } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const sessions = await StudySession.find(filter).sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new study session
// @route   POST /api/planner/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await StudySession.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Session created!', session });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a study session
// @route   PUT /api/planner/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const updated = await StudySession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Session updated!', session: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a study session
// @route   DELETE /api/planner/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.status(200).json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── GOALS ────────────────────────────────────────────────────────

// @desc    Get all goals
// @route   GET /api/planner/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a goal
// @route   POST /api/planner/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Goal created!', goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PUT /api/planner/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Goal updated!', goal: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/planner/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }
    res.status(200).json({ success: true, message: 'Goal deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── STATS ────────────────────────────────────────────────────────

// @desc    Get study stats for dashboard
// @route   GET /api/planner/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalSessions, completedSessions, subjectBreakdown, goals] = await Promise.all([
      StudySession.countDocuments({ user: userId }),
      StudySession.countDocuments({ user: userId, status: 'completed' }),
      StudySession.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: '$subject', totalMinutes: { $sum: '$duration' }, count: { $sum: 1 } } },
        { $sort: { totalMinutes: -1 } },
      ]),
      Goal.find({ user: userId, status: 'active' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0,
        subjectBreakdown,
        activeGoals: goals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions, createSession, updateSession, deleteSession,
  getGoals, createGoal, updateGoal, deleteGoal,
  getStats,
};
