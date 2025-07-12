// models/Fault.js
const mongoose = require('mongoose');

const FaultSchema = new mongoose.Schema({
    code: { type: String, },
    tool: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    photos: [{ type: String }],
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    closedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Fault', FaultSchema);