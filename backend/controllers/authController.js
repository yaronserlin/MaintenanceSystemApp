// controllers/authController.js
const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
};

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Company self-service signup (creates Company + first Admin User)
exports.register = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'No data provided' });
        }

        const { companyName, name, email, password } = req.body;

        if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
            return res.status(400).json({ message: 'Company name must be at least 2 characters' });
        }
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }
        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: 'A valid email address is required' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate unique slug
        let baseSlug = generateSlug(companyName.trim()) || 'company';
        let slug = baseSlug;
        let slugExists = await Company.findOne({ slug });
        if (slugExists) {
            slug = `${baseSlug}-${Date.now().toString(36)}`;
        }

        const company = await Company.create({
            name: companyName.trim(),
            slug,
            isActive: true,
        });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            // Critical #1 Fix: Role is strictly admin for company creator, never from req.body
            const user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                role: 'admin',
                password: hashedPassword,
                companyId: company._id,
            });

            const token = jwt.sign(
                { userId: user._id.toString(), role: user.role, companyId: company._id.toString() },
                process.env.JWT_SECRET,
                { expiresIn: '1d', algorithm: 'HS256' }
            );

            res.cookie('token', token, COOKIE_OPTIONS);

            return res.status(201).json({
                message: 'Company and admin account created successfully',
                token,
                user: {
                    id: user._id,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: {
                        id: company._id,
                        _id: company._id,
                        name: company.name,
                        slug: company.slug,
                    },
                },
            });
        } catch (userErr) {
            // Clean up company if user creation fails
            await Company.findByIdAndDelete(company._id);
            throw userErr;
        }
    } catch (err) {
        next(err);
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'No data provided' });
        }

        const { email, password } = req.body;

        // High #4: NoSQL injection guard - ensure primitive strings
        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Valid email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).populate('companyId');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.companyId || !user.companyId.isActive) {
            return res.status(403).json({ message: 'Company account is inactive' });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role, companyId: user.companyId._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1d', algorithm: 'HS256' }
        );

        res.cookie('token', token, COOKIE_OPTIONS);

        return res.json({
            token,
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: {
                    id: user.companyId._id,
                    _id: user.companyId._id,
                    name: user.companyId.name,
                    slug: user.companyId.slug,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Logged out successfully' });
};

// Current authenticated user profile
exports.me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).populate('companyId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.companyId,
        });
    } catch (err) {
        next(err);
    }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }
        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: 'Valid email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing && existing._id.toString() !== req.user.userId) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name: name.trim(), email: normalizedEmail },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        next(err);
    }
};

// Change password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || typeof currentPassword !== 'string' || !newPassword || typeof newPassword !== 'string') {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Current password incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};