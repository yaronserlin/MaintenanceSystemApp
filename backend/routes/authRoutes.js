// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    me,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, me);
router.put('/me', verifyToken, updateProfile);
router.post('/me/change-password', verifyToken, changePassword);

module.exports = router;