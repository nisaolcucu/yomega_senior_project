const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  getDashboardData,
  getAdminStats,
  getQuickStats,
  approveMember,
  rejectMember,
  getPendingMembers,
  getAllMembers,
    // ← BUNU EKLEYİN
} = require('../controllers/dashboardController');

// Public routes (opsiyonel auth)
router.get('/', optionalAuth, getDashboardData);        // GET /api/dashboard
router.get('/stats', getQuickStats);                    // GET /api/dashboard/stats

// Admin routes
router.use(authenticate);
router.use(requireAdmin);

router.get('/admin/stats', getAdminStats);              // GET /api/dashboard/admin/stats
router.get('/admin/members', getAllMembers);            // GET /api/dashboard/admin/members
router.get('/admin/members/pending', getPendingMembers); // GET /api/dashboard/admin/members/pending
router.put('/admin/members/:userId/approve', approveMember); // PUT /api/dashboard/admin/members/:userId/approve
router.put('/admin/members/:userId/reject', rejectMember); 
  // PUT /api/dashboard/admin/members/:userId/reject

module.exports = router;