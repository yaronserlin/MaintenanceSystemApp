// models/Part.js
const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    partNumber: { type: String },
    tool: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool' },
    inStock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Part', PartSchema);