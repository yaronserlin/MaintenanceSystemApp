// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['operator', 'mechanic', 'admin'], default: 'operator' },
    avatar: { type: String, trim: true, default: null },
    password: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    mustChangePassword: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);