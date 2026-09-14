// controllers/toolController.js
const Tool = require('../models/Tool');
const Fault = require('../models/Fault');
const Part = require('../models/Part');
const Maintenance = require('../models/Maintenance');

const ALLOWED_TOOL_FIELDS = ['name', 'serialNumber', 'description', 'model', 'localSerialNumber'];

const filterToolFields = (body) => {
    const data = {};
    for (const field of ALLOWED_TOOL_FIELDS) {
        if (body[field] !== undefined) {
            data[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
        }
    }
    return data;
};

exports.getAllTools = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const query = { companyId: req.user.companyId };

        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
            const skip = (pageNum - 1) * limitNum;

            const [tools, total] = await Promise.all([
                Tool.find(query)
                    .populate('faults')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                Tool.countDocuments(query),
            ]);

            return res.json({
                tools,
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            });
        }

        const tools = await Tool.find(query)
            .populate('faults')
            .sort({ createdAt: -1 });

        res.json(tools);
    } catch (err) {
        next(err);
    }
};

exports.getToolById = async (req, res, next) => {
    try {
        const tool = await Tool.findOne({ _id: req.params.id, companyId: req.user.companyId })
            .populate({
                path: 'faults',
                populate: {
                    path: 'operator',
                    select: 'name email',
                },
            });

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        res.json(tool);
    } catch (err) {
        next(err);
    }
};

exports.createTool = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'No data provided' });
        }

        const data = filterToolFields(req.body);
        if (!data.name || data.name.trim().length === 0) {
            return res.status(400).json({ message: 'Tool name is required' });
        }

        const tool = await Tool.create({
            ...data,
            companyId: req.user.companyId,
        });

        res.status(201).json(tool);
    } catch (err) {
        next(err);
    }
};

exports.updateTool = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'No data provided' });
        }

        const updates = filterToolFields(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const tool = await Tool.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            updates,
            { new: true, runValidators: true }
        );

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        res.json(tool);
    } catch (err) {
        next(err);
    }
};

exports.deleteTool = async (req, res, next) => {
    try {
        const tool = await Tool.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user.companyId,
        });

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        // Cascade cleanup of dependent records within this company
        await Promise.all([
            Fault.deleteMany({ tool: tool._id, companyId: req.user.companyId }),
            Part.deleteMany({ tool: tool._id, companyId: req.user.companyId }),
            Maintenance.deleteMany({ tool: tool._id, companyId: req.user.companyId }),
        ]);

        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
