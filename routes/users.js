const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get current user profile
router.get('/me', userController.getUserProfile);

// Update current user profile
router.put('/me', userController.updateUserProfile);

// Search users (this must be before /:userId)
router.get('/search', userController.searchUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

module.exports = router; 