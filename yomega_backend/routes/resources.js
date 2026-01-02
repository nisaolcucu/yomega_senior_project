const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadResource, handleUploadError } = require('../middleware/upload');
const {
  getResources,
  getResourceById,
  getResourcesByCategory,
  getFeaturedResources,
  getPopularResources,
  getRecentResources,
  searchResources,
  downloadResource,
  createResource,
  createResourceWithFile,
  updateResource,
  deleteResource,
  getAllResourcesAdmin,
  getUserResources, 
  toggleSaveResource 
} = require('../controllers/resourceController');

// Public routes
router.get('/', optionalAuth, getResources);
router.get('/featured', optionalAuth, getFeaturedResources);
router.get('/popular', optionalAuth, getPopularResources);
router.get('/recent', optionalAuth, getRecentResources);
router.get('/search', optionalAuth, searchResources);
router.get('/category/:category', optionalAuth, getResourcesByCategory);

// ⬇️⬇️⬇️ MEMBER ROUTES - BUNLARI YUKARI TAŞIYIN ⬇️⬇️⬇️
router.get('/my-resources', authenticate, getUserResources);
router.post('/:id/save', authenticate, toggleSaveResource);
router.post('/:id/download', authenticate, downloadResource);
// ⬆️⬆️⬆️ YUKARI TAŞINDI ⬆️⬆️⬆️

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAllResourcesAdmin);
router.post('/', authenticate, requireAdmin, createResource);
router.post('/with-file', authenticate, requireAdmin, uploadResource.single('file'), handleUploadError, createResourceWithFile);
router.put('/:id', authenticate, requireAdmin, updateResource);
router.delete('/:id', authenticate, requireAdmin, deleteResource);

// ⬇️ :id route en sona (çünkü /my-resources ile çakışmasın)
router.get('/:id', optionalAuth, getResourceById);

module.exports = router;