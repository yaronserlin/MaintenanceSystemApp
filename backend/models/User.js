// models/User.js
const mongoose = require('mongoose');

const formatUserName = (name) => {
    if (!name || typeof name !== 'string') return '';
    const trimmed = name.trim();
    if (!trimmed) return '';
    return trimmed
        .split(/\s+/)
        .map(word => {
            return word
                .split('-')
                .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '')
                .join('-');
        })
        .join(' ');
};

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, set: formatUserName },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['operator', 'mechanic', 'admin'], default: 'operator' },
    avatar: { type: String, trim: true, default: null },
    password: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    mustChangePassword: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, default: null },
}, { timestamps: true });

UserSchema.pre('save', function (next) {
    if (this.name) {
        this.name = formatUserName(this.name);
    }
    next();
});

const User = mongoose.model('User', UserSchema);
User.formatUserName = formatUserName;

module.exports = User;