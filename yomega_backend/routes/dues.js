const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllDues,
  getDuesByYear,
  updateDuesStatus,
  createDues,
  deleteDues,
  getDuesStats
} = require('../controllers/duesController');

// Tüm route'lar admin gerektirir
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllDues);                    // GET /api/dues
router.get('/stats', getDuesStats);             // GET /api/dues/stats
router.get('/year/:year', getDuesByYear);       // GET /api/dues/year/2025
router.post('/', createDues);                   // POST /api/dues
router.put('/:id', updateDuesStatus);           // PUT /api/dues/:id
router.delete('/:id', deleteDues);              // DELETE /api/dues/:id

module.exports = router;