const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  getUpcomingPrograms,
  getTodaysPrograms,
  getProgramById,
  getProgramsByCategory,
  searchPrograms,
  getThisWeeksPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getAllProgramsAdmin,
  addParticipant,
  removeParticipant,
  registerForProgram,   
  getUserPrograms,
  unregisterFromProgram,
  getPastPrograms     
} = require('../controllers/programController');

// Public routes (kimlik doğrulama gerektirmez)
router.get('/', optionalAuth, getUpcomingPrograms);
router.get('/past', getPastPrograms);  
router.get('/today', getTodaysPrograms);
router.get('/this-week', getThisWeeksPrograms);
router.get('/search', searchPrograms);
router.get('/category/:category', getProgramsByCategory);

// Member routes (sadece üye girişi gerektirir)
router.get('/my-programs', authenticate, getUserPrograms);
router.post('/:programId/register', authenticate, registerForProgram);
router.post('/:programId/unregister', authenticate, unregisterFromProgram); // ← EKLE
router.post('/:id/join', authenticate, addParticipant);
router.delete('/:id/leave', authenticate, removeParticipant);

// ID route'u en sona koy
router.get('/:id', optionalAuth, getProgramById);

// Admin routes (kimlik doğrulama + admin yetkisi gerektirir)
router.get('/admin/all', authenticate, requireAdmin, getAllProgramsAdmin);
router.post('/', authenticate, requireAdmin, createProgram);
router.put('/:id', authenticate, requireAdmin, updateProgram);
router.delete('/:id', authenticate, requireAdmin, deleteProgram);

module.exports = router;