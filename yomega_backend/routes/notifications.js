const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Tüm route'lar authenticate gerektirir
router.use(authenticate);

router.get('/', getUserNotifications);           // GET /api/notifications
router.put('/:id/read', markAsRead);             // PUT /api/notifications/:id/read
router.put('/mark-all-read', markAllAsRead);     // PUT /api/notifications/mark-all-read

module.exports = router;