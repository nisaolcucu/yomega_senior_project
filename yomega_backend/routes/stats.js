const express = require('express');
const router = express.Router();
const { getHomeStats } = require('../controllers/statsController');

// Public route
router.get('/home', getHomeStats);

module.exports = router;