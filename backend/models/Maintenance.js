// models/Maintenance.js
const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    tool: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true },
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

MaintenanceSchema.index({ companyId: 1, tool: 1 });
MaintenanceSchema.index({ companyId: 1, mechanic: 1 });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);