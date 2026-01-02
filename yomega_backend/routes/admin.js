const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate, requireAdmin } = require('../middleware/auth'); // ✅ DEĞİŞTİ
const User = require('../models/User');

// Admin şifre değiştirme
// ✅ 2 middleware: önce authenticate, sonra requireAdmin
router.post('/change-password', authenticate, requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar gerekli!'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Yeni şifre en az 6 karakter olmalı!'
      });
    }

    // User'ı bul (şifre ile birlikte - select çünkü model'de select: false)
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış!'
      });
    }

    // Yeni şifreyi ata (pre-save hook otomatik hashleyecek)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Admin şifresi değiştirildi: ${user.email}`);

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('❌ Şifre değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken hata oluştu'
    });
  }
});

module.exports = router;