const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getActiveBoardMembers,
  getMembersByPosition,
  getBoardMemberById,
  getCurrentBoard,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
  getAllBoardMembersAdmin,
  endMemberTerm,
  extendMemberTerm
} = require('../controllers/boardMemberController');
const { uploadImage, handleUploadError } = require('../middleware/upload'); 

// ✅ Admin routes ÖNCE (daha spesifik route'lar önce gelmeli)
router.get('/admin/all', authenticate, requireAdmin, getAllBoardMembersAdmin);

// ✅ Public routes
router.get('/', getActiveBoardMembers);
router.get('/current', getCurrentBoard);
router.get('/position/:position', getMembersByPosition);
router.get('/:id', getBoardMemberById);

// ✅ Admin routes (kimlik doğrulama + admin yetkisi gerektirir)
router.post('/', 
  authenticate, 
  requireAdmin,
  uploadImage.single('image'),
  handleUploadError,
  createBoardMember
);

router.put('/:id', 
  authenticate, 
  requireAdmin,
  uploadImage.single('image'),
  handleUploadError,
  updateBoardMember
);

router.delete('/:id', 
  authenticate, 
  requireAdmin, 
  deleteBoardMember
);

router.post('/:id/end-term', 
  authenticate, 
  requireAdmin, 
  endMemberTerm
);

router.post('/:id/extend-term', 
  authenticate, 
  requireAdmin, 
  extendMemberTerm
);

module.exports = router;