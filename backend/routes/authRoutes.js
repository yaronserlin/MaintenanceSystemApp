// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    register,
    login,
    logout,
    me,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', verifyToken, me);
router.put('/me', verifyToken, updateProfile);
router.post('/me/change-password', verifyToken, changePassword);

module.exports = router;