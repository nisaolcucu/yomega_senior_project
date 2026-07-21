const path = require('path');
const fs = require('fs');
const { deleteFile } = require('../middleware/upload');

// Tek dosya yükleme
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi'
      });
    }
    
    const file = req.file;
    const fileUrl = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;
    
    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      data: {
        file: {
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: fileUrl
        }
      }
    });
    
  } catch (error) {
    console.error('Upload Single File Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yüklenirken hata oluştu'
    });
  }
};

// Çoklu dosya yükleme
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dosya seçilmedi'
      });
    }
    
    const files = req.files.map(file => {
      const fileUrl = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;
      return {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUrl
      };
    });
    
    res.json({
      success: true,
      message: `${files.length} dosya başarıyla yüklendi`,
      data: { files }
    });
    
  } catch (error) {
    console.error('Upload Multiple Files Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosyalar yüklenirken hata oluştu'
    });
  }
};

// Resim yükleme (özel işlem)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası seçilmedi'
      });
    }
    
    const file = req.file;
    const fileUrl = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;
    
    // Resim boyutları ve diğer bilgiler eklenebilir (sharp kütüphanesi ile)
    
    res.json({
      success: true,
      message: 'Resim başarıyla yüklendi',
      data: {
        image: {
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: fileUrl,
          type: 'image'
        }
      }
    });
    
  } catch (error) {
    console.error('Upload Image Error:', error);
    res.status(500).json({
      success: false,
      message: 'Resim yüklenirken hata oluştu'
    });
  }
};

// Dosya silme
const deleteUploadedFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { folder } = req.query; // uploads/resources, uploads/news etc.
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Dosya adı gereklidir'
      });
    }
    
    const safeFolder = folder || 'uploads/temp';
    const filePath = path.join(safeFolder, filename);
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve('uploads');
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz dosya yolu'
      });
    }
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }
    
    await deleteFile(resolvedPath);
    
    res.json({
      success: true,
      message: 'Dosya başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Delete File Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya silinirken hata oluştu'
    });
  }
};

// Dosya bilgilerini getirme
const getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    const { folder } = req.query;
    
    const safeFolder = folder || 'uploads/temp';
    const filePath = path.join(safeFolder, filename);
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve('uploads');
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz dosya yolu'
      });
    }
    
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }
    
    const stats = fs.statSync(resolvedPath);
    const ext = path.extname(filename);
    
    res.json({
      success: true,
      data: {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: ext,
        path: filePath
      }
    });
    
  } catch (error) {
    console.error('Get File Info Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya bilgileri alınırken hata oluştu'
    });
  }
};

// Temp klasörünü temizleme (admin only)
const cleanTempFolder = async (req, res) => {
  try {
    const tempDir = 'uploads/temp';
    
    if (!fs.existsSync(tempDir)) {
      return res.json({
        success: true,
        message: 'Temp klasörü zaten temiz'
      });
    }
    
    const files = fs.readdirSync(tempDir);
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      // 24 saatten eski dosyaları sil
      const isOld = Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000;
      
      if (isOld) {
        await deleteFile(filePath);
        deletedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `${deletedCount} eski dosya silindi`,
      data: { deletedCount }
    });
    
  } catch (error) {
    console.error('Clean Temp Folder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Temp klasörü temizlenirken hata oluştu'
    });
  }
};

// Dosya listesi (admin only)
const getUploadedFiles = async (req, res) => {
  try {
    const { folder = 'temp' } = req.query;
    const uploadDir = `uploads/${folder}`;
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: { files: [] }
      });
    }
    
    const files = fs.readdirSync(uploadDir).map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: path.extname(filename),
        url: `/${uploadDir}/${filename}`
      };
    });
    
    res.json({
      success: true,
      data: { files }
    });
    
  } catch (error) {
    console.error('Get Uploaded Files Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya listesi alınırken hata oluştu'
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadImage,
  deleteUploadedFile,
  getFileInfo,
  cleanTempFolder,
  getUploadedFiles
};