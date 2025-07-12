// models/Tool.js
const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    serialNumber: { type: String },
    description: { type: String },
    model: { type: String },
    localSerialNumber: { type: String },
    faults: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fault'
    }],
}, { timestamps: true });

module.exports = mongoose.model('Tool', ToolSchema);