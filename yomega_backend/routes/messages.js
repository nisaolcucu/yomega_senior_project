const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getUserMessages,
  createSupportRequest,
  markMessageAsRead,
  replyToMessage,
  getAllMessages,
  sendAnnouncement,
  sendDirectMessage,
  updateMessageStatus,
  deleteMessage,
  createContactMessage
} = require('../controllers/messageController');

// Public route - iletişim formu (auth gerektirmez)
router.post('/contact', createContactMessage);

// User routes (kimlik doğrulama gerektirir)
router.use(authenticate);

router.get('/my-messages', getUserMessages);              // GET /api/messages/my-messages
router.post('/support', createSupportRequest);            // POST /api/messages/support
router.put('/:id/read', markMessageAsRead);               // PUT /api/messages/:id/read
router.post('/:id/reply', replyToMessage);                // POST /api/messages/:id/reply
// ⬆️ Bu satırdan sonra router.use(authenticate); TEKRAR yazılmişti - SİLDİM

// Admin routes (admin yetkisi gerektirir)
router.get('/admin/all', requireAdmin, getAllMessages);   // GET /api/messages/admin/all
router.post('/announcement', requireAdmin, sendAnnouncement);  // POST /api/messages/announcement
router.post('/direct', requireAdmin, sendDirectMessage);  // POST /api/messages/direct
router.put('/:id/status', requireAdmin, updateMessageStatus); // PUT /api/messages/:id/status
router.delete('/:id', deleteMessage);                     // DELETE /api/messages/:id

module.exports = router;