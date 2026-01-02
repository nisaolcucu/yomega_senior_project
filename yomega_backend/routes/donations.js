const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllDonations,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationStats
} = require('../controllers/donationController');

// Tüm route'lar admin gerektirir
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllDonations);               // GET /api/donations
router.get('/stats', getDonationStats);         // GET /api/donations/stats
router.post('/', createDonation);               // POST /api/donations
router.put('/:id', updateDonation);             // PUT /api/donations/:id
router.delete('/:id', deleteDonation);          // DELETE /api/donations/:id

module.exports = router;