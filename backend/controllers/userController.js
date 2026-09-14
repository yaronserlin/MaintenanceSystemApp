// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

const ALLOWED_ROLES = ['operator', 'mechanic', 'admin'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ companyId: req.user.companyId })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'No data provided' });
        }

        const { name, email, password, role } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }
        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: 'A valid email address is required' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const userRole = role && ALLOWED_ROLES.includes(role) ? role : 'operator';
        const normalizedEmail = email.trim().toLowerCase();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole,
            companyId: req.user.companyId,
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (err) {
        next(err);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!role || !ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({ message: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });
        }

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user.companyId,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
};