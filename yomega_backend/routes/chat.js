const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { handleChat } = require('../controllers/chatController');

// Chat endpoint
router.post('/', optionalAuth, handleChat);

module.exports = router;