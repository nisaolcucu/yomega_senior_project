const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  sendTestEmail,
  createBackup,
  getSystemStatus
} = require('../controllers/settingsController');

// Tüm ayarlar admin yetkisi gerektirir
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-email', sendTestEmail);
router.post('/backup', createBackup);
router.get('/system-status', getSystemStatus);

module.exports = router;