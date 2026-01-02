const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  uploadSignedForm,
  getMyFormStatus,
  getAllSignedForms,
  updateSignedFormStatus,
  deleteSignedForm
} = require('../controllers/membershipFormController');

// Uploads klasörünü kontrol et ve oluştur
const uploadDir = path.join(__dirname, '../uploads/signed-forms');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ signed-forms klasörü oluşturuldu');
}

// Multer config - İmzalı formlar için
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `signed-form-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Sadece PDF kabul et
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Sadece PDF dosyaları kabul edilir'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handler for multer
const multerErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
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

// İmzalı form yükle
router.post(
  '/upload', 
  authenticate, 
  upload.single('signedForm'),
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