// controllers/maintenanceController.js
const Maintenance = require('../models/Maintenance');

exports.getAllMaintenance = async (req, res) => {
    const logs = await Maintenance.find().populate('tool mechanic');
    res.json(logs);
};

exports.createMaintenance = async (req, res) => {
    const maintenance = await Maintenance.create({
        ...req.body,
        mechanic: req.user.userId,
    });
    res.status(201).json(maintenance);
};