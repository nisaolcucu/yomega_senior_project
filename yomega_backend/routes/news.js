const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  getFeaturedNews,
  getNewsByCategory,
  searchNews,
  createNews,
  updateNews,
  deleteNews,
  getAllNewsAdmin
} = require('../controllers/newsController');

// Public routes (kimlik doğrulama gerektirmez)
router.get('/', getAllNews);                          // GET /api/news
router.get('/featured', getFeaturedNews);             // GET /api/news/featured  
router.get('/search', searchNews);                    // GET /api/news/search?q=...
router.get('/category/:category', getNewsByCategory); // GET /api/news/category/egitim

// Admin routes (kimlik doğrulama + admin yetkisi gerektirir)
router.post('/', authenticate, requireAdmin, createNews);           // POST /api/news
router.put('/:id', authenticate, requireAdmin, updateNews);         // PUT /api/news/60d5ecb74cd3b01234567890
router.delete('/:id', authenticate, requireAdmin, deleteNews);      // DELETE /api/news/60d5ecb74cd3b01234567890
router.get('/admin/all', authenticate, requireAdmin, getAllNewsAdmin); // GET /api/news/admin/all

// ⬇️⬇️⬇️ ÖNEMLİ: Slug route'u EN SONA koy ⬇️⬇️⬇️
router.get('/:slug', getNewsBySlug);  // GET /api/news/haber-basligi-123

module.exports = router;