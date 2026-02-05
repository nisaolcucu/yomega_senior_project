const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage için Cloudinary kullan
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yomega/signed-forms',
    resource_type: 'raw', // ✅ DEĞİŞTİ: 'auto' → 'raw'
    allowed_formats: ['pdf'],
    public_id: (req, file) => {
      const userId = req.user?._id || 'guest';
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      return `${timestamp}-${userId}-${originalName}`;
    },
    // ✅ YENİ EKLE: Format belirt
    format: 'pdf'
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // ✅ 5MB → 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyaları kabul edilir!'), false);
    }
  }
});

module.exports = { cloudinary, upload };