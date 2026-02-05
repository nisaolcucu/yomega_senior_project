const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cloudinary, upload } = require('../config/cloudinary'); // ✅ YENİ
const {
  uploadSignedForm,
  getMyFormStatus,
  getAllSignedForms,
  updateSignedFormStatus,
  deleteSignedForm
} = require('../controllers/membershipFormController');

// ❌ ESKİ MULTER KODLARI SİL - ARTIK GEREKMİYOR
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const uploadDir = ...
// const storage = ...

// Error handler for multer
const multerErrorHandler = (error, req, res, next) => {
  if (error instanceof require('multer').MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu 5MB\'dan büyük olamaz'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası: ' + error.message
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

// ===== ÜYE ROUTES =====

// İmzalı form yükle (Cloudinary ile)
router.post(
  '/upload', 
  authenticate, 
  upload.single('signedForm'), // ✅ Cloudinary upload
  multerErrorHandler,
  uploadSignedForm
);

// Kendi form durumunu getir
router.get('/my-status', authenticate, getMyFormStatus);

// ===== ADMIN ROUTES =====

// Tüm imzalı formları listele
router.get('/admin/all', authenticate, requireAdmin, getAllSignedForms);

// İmzalı formu onayla/reddet
router.put('/admin/:userId/status', authenticate, requireAdmin, updateSignedFormStatus);

// İmzalı formu sil
router.delete('/admin/:userId', authenticate, requireAdmin, deleteSignedForm);

module.exports = router;