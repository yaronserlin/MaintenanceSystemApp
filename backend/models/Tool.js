// models/Tool.js
const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    name: { type: String, required: true, trim: true },
    serialNumber: { type: String, trim: true },
    description: { type: String, trim: true },
    model: { type: String, trim: true },
    localSerialNumber: { type: String, trim: true },
    faults: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fault',
    }],
}, { timestamps: true });

ToolSchema.index({ companyId: 1, name: 1 });

module.exports = mongoose.model('Tool', ToolSchema);