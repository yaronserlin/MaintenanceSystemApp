// controllers/faultController.js
const Fault = require('../models/Fault');

exports.getAllFaults = async (req, res) => {
    const faults = await Fault.find().populate('tool operator');
    res.json(faults);
};

exports.getFaultById = async (req, res) => {
    const fault = await Fault.findById(req.params.id).populate('tool operator');
    if (!fault) return res.status(404).json({ message: 'Fault not found' });
    res.json(fault);
};

exports.createFault = async (req, res) => {
    const photos = req.files ? req.files.map(f => f.path) : [];
    const fault = await Fault.create({ ...req.body, operator: req.user.userId, photos });
    res.status(201).json(fault);
};

exports.closeFault = async (req, res) => {
    const fault = await Fault.findByIdAndUpdate(
        req.params.id,
        { status: 'closed' },
        { new: true }
    );
    res.json(fault);
};