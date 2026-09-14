// models/Fault.js
const mongoose = require('mongoose');

const FaultSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    code: { type: String, trim: true },
    tool: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true, trim: true },
    photos: [{ type: String }],
    engineHours: { type: Number, min: 0 },
    closingEngineHours: { type: Number, min: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    closedAt: { type: Date },
}, { timestamps: true });

FaultSchema.index({ companyId: 1, tool: 1 });
FaultSchema.index({ companyId: 1, operator: 1 });
FaultSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Fault', FaultSchema);