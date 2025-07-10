// controllers/partController.js
const Part = require('../models/Part');

exports.getAllParts = async (req, res) => {
    const parts = await Part.find().populate('tool');
    res.json(parts);
};

exports.createPart = async (req, res) => {
    const part = await Part.create(req.body);
    res.status(201).json(part);
};

exports.updatePart = async (req, res) => {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(part);
};

exports.deletePart = async (req, res) => {
    await Part.findByIdAndDelete(req.params.id);
    res.json({ message: 'Part deleted' });
};