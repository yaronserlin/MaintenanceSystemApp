// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'No data provided' });
    const { name, email, password, role } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, role, password: hashed });
        res.status(201).json({ message: 'User registered', userId: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Login an existing user
exports.login = async (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'No data provided' });
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, email: user.email, id: user._id, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get current user's profile
exports.me = async (req, res) => {
    const { userId } = req.user;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        res.json({ name: user.name, email: user.email, id: user._id, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update current user's name and email
exports.updateProfile = async (req, res) => {
    const { userId } = req.user;
    const { name, email } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing && existing._id.toString() !== userId) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const user = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true }
        );
        res.json({ name: user.name, email: user.email, id: user._id, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Change current user's password
exports.changePassword = async (req, res) => {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Current password incorrect' });
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};