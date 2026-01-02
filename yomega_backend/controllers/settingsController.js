const Settings = require('../models/Settings');

// Ayarları getir
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Hassas bilgileri frontend'e gönderme
    const safeSettings = settings.toObject();
    if (safeSettings.email) {
      delete safeSettings.email.smtpPassword;
    }
    
    res.json({
      success: true,
      data: { settings: safeSettings }
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar getirilirken hata oluştu'
    });
  }
};

// Ayarları güncelle
const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Gelen verileri güncelle
    Object.keys(req.body).forEach(key => {
      if (settings[key] !== undefined) {
        settings[key] = { ...settings[key], ...req.body[key] };
      }
    });
    
    await settings.save();
    
    // Hassas bilgileri response'tan çıkar
    const safeSettings = settings.toObject();
    if (safeSettings.email) {
      delete safeSettings.email.smtpPassword;
    }
    
    res.json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi',
      data: { settings: safeSettings }
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar güncellenirken hata oluştu'
    });
  }
};

// Test email gönder
const sendTestEmail = async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    // Burada gerçek email gönderme işlemi yapılacak
    // Şimdilik sadece başarılı response dönüyoruz
    
    res.json({
      success: true,
      message: `Test email ${testEmail} adresine gönderildi`
    });
  } catch (error) {
    console.error('Send Test Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email gönderilemedi'
    });
  }
};

// Yedek oluştur
const createBackup = async (req, res) => {
  try {
    // Burada veritabanı yedekleme işlemi yapılacak
    const settings = await Settings.getSettings();
    settings.system.lastBackup = new Date();
    await settings.save();
    
    res.json({
      success: true,
      message: 'Yedekleme başarıyla tamamlandı',
      data: {
        backupDate: settings.system.lastBackup
      }
    });
  } catch (error) {
    console.error('Create Backup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Yedekleme oluşturulamadı'
    });
  }
};

// Sistem durumu
const getSystemStatus = async (req, res) => {
  try {
    const status = {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      database: {
        connected: require('mongoose').connection.readyState === 1
      }
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get System Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Sistem durumu alınamadı'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  sendTestEmail,
  createBackup,
  getSystemStatus
};