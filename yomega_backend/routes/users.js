const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAllUsers, deleteUser, updateUser } = require('../controllers/userController');
const User = require('../models/User');

// Admin routes
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

// ✅ YENİ: Admin kendi email'ini değiştirme
router.put('/account/update-email', async (req, res) => {
    try {
        const { newEmail, currentPassword } = req.body;

        // Validasyon
        if (!newEmail || !currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Yeni email ve mevcut şifre gereklidir'
            });
        }

        // Email format kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir email adresi giriniz'
            });
        }

        // Kullanıcıyı şifresiyle birlikte getir
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Mevcut şifre kontrolü
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre hatalı'
            });
        }

        // Email benzersizlik kontrolü
        const existingUser = await User.findOne({
            email: newEmail.toLowerCase(),
            _id: { $ne: user._id }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }

        // Email güncelle
        user.email = newEmail.toLowerCase();
        await user.save();

        res.json({
            success: true,
            message: 'Email başarıyla güncellendi',
            data: {
                email: user.email
            }
        });

    } catch (error) {
        console.error('Email güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Email güncellenirken bir hata oluştu'
        });
    }
});

// ✅ YENİ: Admin kendi şifresini değiştirme
router.put('/account/update-password', async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validasyon
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanlar gereklidir'
            });
        }

        // Yeni şifre kontrolü
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifreler eşleşmiyor'
            });
        }

        // Şifre uzunluk kontrolü
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre en az 6 karakter olmalıdır'
            });
        }

        // Kullanıcıyı şifresiyle birlikte getir
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Mevcut şifre kontrolü
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre hatalı'
            });
        }

        // Yeni şifre eski şifre ile aynı olmamalı
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre eski şifre ile aynı olamaz'
            });
        }

        // Şifre güncelle (pre-save middleware otomatik hash'leyecek)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Şifre başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre güncellenirken bir hata oluştu'
        });
    }
});

module.exports = router;