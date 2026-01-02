const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  createApplication,
  getUserApplications,
  getApplicationById,
  getAllApplications,
  getPendingApplications,
  getOverdueApplications,
  approveApplication,
  rejectApplication,
  moveToWaitlist,
  startReview,
  addNote,
  updateApplication
} = require('../controllers/applicationController');

// Public routes (kimlik doğrulama gerektirmez)
router.post('/', optionalAuth, createApplication);       // POST /api/applications

// Member routes (kimlik doğrulama gerektirir)
router.use(authenticate); // Bu satırdan sonraki tüm route'lar authenticate edilecek

router.get('/my-applications', getUserApplications);     // GET /api/applications/my-applications
router.get('/:id', getApplicationById);                  // GET /api/applications/60d5ecb74cd3b01234567890

// Admin routes (kimlik doğrulama + admin yetkisi gerektirir)
router.use(requireAdmin); // Bu satırdan sonraki tüm route'lar admin yetkisi gerektirecek

router.get('/admin/all', getAllApplications);            // GET /api/applications/admin/all
router.get('/admin/pending', getPendingApplications);    // GET /api/applications/admin/pending
router.get('/admin/overdue', getOverdueApplications);    // GET /api/applications/admin/overdue

router.put('/:id', updateApplication);                   // PUT /api/applications/60d5ecb74cd3b01234567890
router.post('/:id/approve', approveApplication);         // POST /api/applications/60d5ecb74cd3b01234567890/approve
router.post('/:id/reject', rejectApplication);           // POST /api/applications/60d5ecb74cd3b01234567890/reject
router.post('/:id/waitlist', moveToWaitlist);            // POST /api/applications/60d5ecb74cd3b01234567890/waitlist
router.post('/:id/review', startReview);                 // POST /api/applications/60d5ecb74cd3b01234567890/review
router.post('/:id/notes', addNote);                      // POST /api/applications/60d5ecb74cd3b01234567890/notes

module.exports = router;