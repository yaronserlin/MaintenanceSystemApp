// controllers/toolController.js
const Tool = require('../models/Tool');

exports.getAllTools = async (req, res) => {
    const tools = await Tool.find().populate('faults');
    res.json(tools);
};

exports.getToolById = async (req, res) => {
    const tool = await Tool.findById(req.params.id)
        .populate({
            path: 'faults',
            populate: {
                path: 'operator',
                select: 'name'
            }

        });
    if (!tool) return res.status(404).json({ message: 'Tool not found' });
    res.json(tool);
};



exports.createTool = async (req, res) => {
    const tool = await Tool.create(req.body);
    res.status(201).json(tool);
};

exports.updateTool = async (req, res) => {
    const tool = await Tool.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    if (!tool) return res.status(404).json({ message: 'Tool not found' });
    res.json(tool);
};

exports.deleteTool = async (req, res) => {
    await Tool.findByIdAndDelete(req.params.id);
    res.status(204).end();
};
