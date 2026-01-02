const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { 
  upload, 
  uploadResource, 
  uploadImage, 
  handleUploadError 
} = require('../middleware/upload');
const {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadImage: uploadImageController,
  deleteUploadedFile,
  getFileInfo,
  cleanTempFolder,
  getUploadedFiles
} = require('../controllers/uploadController');

// Public/Member routes
router.use(authenticate); // Tüm upload işlemleri için giriş gerekli

// Tek dosya yükleme
router.post('/single', 
  upload.single('file'), 
  handleUploadError, 
  uploadSingleFile
);

// Çoklu dosya yükleme (maksimum 5 dosya)
router.post('/multiple', 
  upload.array('files', 5), 
  handleUploadError, 
  uploadMultipleFiles
);

// Resim yükleme
router.post('/image', 
  uploadImage.single('image'), 
  handleUploadError, 
  uploadImageController
);

// Kaynak dosyası yükleme
router.post('/resource', 
  uploadResource.single('resource'), 
  handleUploadError, 
  uploadSingleFile
);

// Dosya bilgisi getirme
router.get('/info/:filename', getFileInfo);

// Admin routes
router.use(requireAdmin);

// Dosya silme
router.delete('/:filename', deleteUploadedFile);

// Dosya listesi
router.get('/files', getUploadedFiles);

// Temp klasörü temizleme
router.post('/clean-temp', cleanTempFolder);

module.exports = router;