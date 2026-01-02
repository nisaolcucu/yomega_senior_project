const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörlerini oluştur
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/resources',
    'uploads/news',
    'uploads/board-members',
    'uploads/applications',
    'uploads/temp'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Klasör oluşturuldu: ${dir}`);
    }
  });
};

// Klasörleri oluştur
createUploadDirs();

// Dosya türü kontrolü
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    // Resim dosyaları
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    
    // Dokuman dosyaları
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    
    // Arşiv dosyaları
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    
    // Text dosyaları
    'text/plain': ['.txt'],
    'text/csv': ['.csv']
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Desteklenmeyen dosya türü: ${file.mimetype}`), false);
  }
};

// Dosya boyutu limitleri (MB)
const fileSizeLimits = {
  image: 10 * 1024 * 1024,     // 5MB → 10MB yaptık
  document: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024,     // 50MB
  default: 10 * 1024 * 1024    // 10MB
};

// Dosya boyutu kontrolü
const getFileSize = (mimetype) => {
  if (mimetype.startsWith('image/')) return fileSizeLimits.image;
  if (mimetype.startsWith('video/')) return fileSizeLimits.video;
  return fileSizeLimits.document;
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/temp'; // Varsayılan
    
    // Route'a göre klasör belirleme
    if (req.route.path.includes('resource') || req.baseUrl.includes('resource')) {
      uploadPath = 'uploads/resources';
    } else if (req.route.path.includes('news') || req.baseUrl.includes('news')) {
      uploadPath = 'uploads/news';
    } else if (req.route.path.includes('image')) {
      // Tüm image uploadları için board-members klasörü kullan (geçici çözüm)
      uploadPath = 'uploads/board-members';
    } else if (req.route.path.includes('applications') || req.baseUrl.includes('applications')) {
      uploadPath = 'uploads/applications';
    }
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Türkçe karakterleri temizle
    const cleanFileName = file.originalname
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9.-]/g, '_');
    
    // Timestamp ekle
    const timestamp = Date.now();
    const ext = path.extname(cleanFileName);
    const name = path.basename(cleanFileName, ext);
    
    const filename = `${name}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Ana upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileSizeLimits.default
  }
});

// Özel upload middleware'ler
const uploadResource = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileSizeLimits.document
  }
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
    }
  },
  limits: {
    fileSize: fileSizeLimits.image
  }
});

// Dosya silme helper
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Dosya silinirken hata:', err);
        reject(err);
      } else {
        console.log('Dosya silindi:', filePath);
        resolve();
      }
    });
  });
};

// Error handler
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Çok fazla dosya. Maksimum 5 dosya yükleyebilirsiniz.'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  uploadResource,
  uploadImage,
  deleteFile,
  handleUploadError,
  createUploadDirs
};