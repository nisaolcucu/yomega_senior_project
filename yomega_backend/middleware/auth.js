const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token doğrulama middleware
const authenticate = async (req, res, next) => {
  try {
    // Token'i header'dan al
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Giriş yapmak gereklidir'
      });
    }
    
    // Token'i doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif durumda'
      });
    }
    
    // Kullanıcıyı request'e ekle
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Kimlik doğrulama hatası'
    });
  }
};

// Admin yetkisi kontrolü
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Önce giriş yapmalısınız'
    });
  }
  
  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir'
    });
  }
  
  next();
};

// Kullanıcı kendi bilgilerini veya admin herhangi birinin bilgilerini görebilir
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Önce giriş yapmalısınız'
    });
  }
  
  const requestedUserId = req.params.userId || req.params.id;
  const isOwner = req.user._id.toString() === requestedUserId;
  const isAdmin = req.user.isAdmin();
  
  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Bu bilgilere erişim yetkiniz yok'
    });
  }
  
  next();
};

// Opsiyonel auth - token varsa kullanıcıyı yükle, yoksa devam et
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Token hatalı olsa bile devam et
    next();
  }
};

// JWT token oluşturma helper fonksiyonu
const generateToken = (userId, role = 'member') => {
  const expiresIn = role === 'admin' ? '2h' : '7d'; // Admin için 2 saat, üye için 7 gün
  
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Token'den kullanıcı ID'si çıkarma
const extractUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth,
  generateToken,
  extractUserIdFromToken
};