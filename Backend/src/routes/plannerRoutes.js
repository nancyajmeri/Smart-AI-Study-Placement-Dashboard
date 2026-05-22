const express = require('express');
const { body } = require('express-validator');
const {
  getSessions, createSession, updateSession, deleteSession,
  getGoals, createGoal, updateGoal, deleteGoal,
  getStats,
} = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All planner routes are protected
router.use(protect);

// ─── SESSIONS ─────────────────────────────────────────────────────
router.get('/sessions', getSessions);

router.post(
  '/sessions',
  [
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
  ],
  createSession
);

router.put('/sessions/:id', updateSession);
router.delete('/sessions/:id', deleteSession);

// ─── GOALS ────────────────────────────────────────────────────────
router.get('/goals', getGoals);

router.post(
  '/goals',
  [
    body('title').trim().notEmpty().withMessage('Goal title is required'),
    body('targetHours')
      .isFloat({ min: 0.5 })
      .withMessage('Target hours must be at least 0.5'),
  ],
  createGoal
);

router.put('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);

// ─── STATS ────────────────────────────────────────────────────────
router.get('/stats', getStats);

module.exports = router;
