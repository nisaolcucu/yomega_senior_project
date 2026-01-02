const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  globalSearch,
  getSearchSuggestions
} = require('../controllers/searchController');

// Global search endpoint
router.get('/', optionalAuth, globalSearch);

// Search suggestions for autocomplete
router.get('/suggestions', optionalAuth, getSearchSuggestions);

module.exports = router;