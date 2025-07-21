// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
};

exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json(user);
};

exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
};