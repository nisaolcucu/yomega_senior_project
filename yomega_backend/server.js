const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy for Plesk/nginx
app.set('trust proxy', 1);

// CORS ayarları
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js development
    'http://localhost:3001',  // Alternatif port
    'https://yomega-senior-project.onrender.com',  // ← Render frontend URL'iniz

  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type'] // ← EKLE
}));

// Middleware'ler
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // ← EKLE
  crossOriginEmbedderPolicy: false // ← EKLE
})); // Güvenlik


// Rate limiting
// Rate limiting - sadece production'da aktif
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // 1000 istek (çok arttırdık)
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false
});

// Sadece production'da rate limit uygula
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
} else {
  console.log('⚠️ Rate limiting devre dışı (development mode)');
}
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static dosyalar için uploads klasörü
app.use('/uploads', express.static('uploads'));

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı!');
  })
  .catch((error) => {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  });

// Test route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Dernek Backend API çalışıyor!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const programRoutes = require('./routes/programs');
const boardMemberRoutes = require('./routes/boardMembers');
const resourceRoutes = require('./routes/resources');
const applicationRoutes = require('./routes/applications');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const duesRoutes = require('./routes/dues');
const donationRoutes = require('./routes/donations');
const searchRoutes = require('./routes/search');
const chatRoutes = require('./routes/chat');
const membershipFormRoutes = require('./routes/membershipFormRoutes'); // ✅ YENİ
const adminRoutes = require('./routes/admin'); // ✅ YENİ

app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/board-members', boardMemberRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/membership-forms', membershipFormRoutes); // ✅ YENİ
app.use('/api/admin', adminRoutes); // ✅ YENİ

const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler - Özel route tanımlaması yapmadan önce
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint bulunamadı',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Bir hata oluştu'
      : error.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌟 Server ${PORT} portunda çalışıyor`);
  console.log(`🌐 Ana URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📰 News API: http://localhost:${PORT}/api/news`);
  console.log(`📅 Programs API: http://localhost:${PORT}/api/programs`);
  console.log(`👥 Board Members API: http://localhost:${PORT}/api/board-members`);
  console.log(`📚 Resources API: http://localhost:${PORT}/api/resources`);
  console.log(`📝 Applications API: http://localhost:${PORT}/api/applications`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`📤 Upload API: http://localhost:${PORT}/api/upload`);
  console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
  console.log(`💬 Messages API: http://localhost:${PORT}/api/messages`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search`);
  console.log(`🤖 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📋 Membership Forms API: http://localhost:${PORT}/api/membership-forms`); // ✅ YENİ
});