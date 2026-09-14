// models/Part.js
const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    name: { type: String, required: true, trim: true },
    partNumber: { type: String, trim: true },
    tool: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool' },
    inStock: { type: Number, default: 0 },
}, { timestamps: true });

PartSchema.index({ companyId: 1, tool: 1 });

module.exports = mongoose.model('Part', PartSchema);