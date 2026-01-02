const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

// Public routes (kimlik doğrulama gerektirmez)
router.post('/register', register);
router.post('/login', login);


// Protected routes (kimlik doğrulama gerektirir)
router.use(authenticate); // Bu satırdan sonraki tüm route'lar authenticate edilecek

router.get('/profile', getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

module.exports = router;