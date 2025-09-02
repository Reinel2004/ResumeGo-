const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// POST /api/feedback - Send feedback email
router.post('/', feedbackController.sendFeedback);

module.exports = router;
