const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAllUsers, deleteUser, updateUser } = require('../controllers/userController');

// Admin routes
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllUsers); 
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;