// controllers/faultController.js
const Fault = require('../models/Fault');
const Tool = require('../models/Tool');

exports.getAllFaults = async (req, res, next) => {
    try {
        const { page, limit, status } = req.query;
        const query = { companyId: req.user.companyId };
        if (status) {
            query.status = status;
        }

        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
            const skip = (pageNum - 1) * limitNum;

            const [faults, total] = await Promise.all([
                Fault.find(query)
                    .populate('tool', 'name serialNumber model')
                    .populate('operator', 'name email role')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                Fault.countDocuments(query),
            ]);

            return res.json({
                faults,
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            });
        }

        const faults = await Fault.find(query)
            .populate('tool', 'name serialNumber model')
            .populate('operator', 'name email role')
            .sort({ createdAt: -1 });

        res.json(faults);
    } catch (err) {
        next(err);
    }
};

exports.getFaultById = async (req, res, next) => {
    try {
        const fault = await Fault.findOne({ _id: req.params.id, companyId: req.user.companyId })
            .populate('tool')
            .populate('operator', 'name email role');

        if (!fault) {
            return res.status(404).json({ message: 'Fault not found' });
        }
        res.json(fault);
    } catch (err) {
        next(err);
    }
};

exports.createFault = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'No data provided' });
        }

        const { tool: toolId, description, code, photos: bodyPhotos, engineHours } = req.body;

        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({ message: 'Description is required' });
        }

        if (!toolId) {
            return res.status(400).json({ message: 'Tool reference is required' });
        }

        // Validate that the tool belongs to this company
        const tool = await Tool.findOne({ _id: toolId, companyId: req.user.companyId });
        if (!tool) {
            return res.status(400).json({ message: 'Referenced tool does not exist in your organization' });
        }

        // Gather uploaded photo paths / filenames
        const uploadedPhotos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        // Parse any photo URLs sent in the body
        let additionalPhotos = [];
        if (bodyPhotos) {
            if (Array.isArray(bodyPhotos)) {
                additionalPhotos = bodyPhotos.filter(p => typeof p === 'string' && p.trim().length > 0);
            } else if (typeof bodyPhotos === 'string') {
                additionalPhotos = bodyPhotos.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        const allPhotos = [...uploadedPhotos, ...additionalPhotos];

        const parsedHours = engineHours !== undefined && engineHours !== '' ? parseFloat(engineHours) : undefined;
        const validHours = parsedHours !== undefined && !isNaN(parsedHours) && parsedHours >= 0 ? parsedHours : undefined;

        const fault = await Fault.create({
            companyId: req.user.companyId,
            tool: tool._id,
            operator: req.user.userId,
            description: description.trim(),
            code: code && typeof code === 'string' ? code.trim() : undefined,
            engineHours: validHours,
            photos: allPhotos,
            status: 'open',
        });

        // Atomically push fault into Tool backref and update current hours if provided
        const toolUpdates = { $push: { faults: fault._id } };
        if (validHours !== undefined && validHours > (tool.currentEngineHours || 0)) {
            toolUpdates.$set = { currentEngineHours: validHours };
        }
        await Tool.findOneAndUpdate(
            { _id: tool._id, companyId: req.user.companyId },
            toolUpdates
        );

        const populatedFault = await Fault.findById(fault._id)
            .populate('tool', 'name serialNumber model currentEngineHours')
            .populate('operator', 'name email role');

        res.status(201).json(populatedFault);
    } catch (err) {
        next(err);
    }
};

exports.closeFault = async (req, res, next) => {
    try {
        const { engineHours } = req.body || {};
        const parsedHours = engineHours !== undefined && engineHours !== '' ? parseFloat(engineHours) : null;
        const validHours = parsedHours !== null && !isNaN(parsedHours) && parsedHours >= 0 ? parsedHours : null;

        const updateData = {
            status: 'closed',
            closedAt: new Date(),
        };
        if (validHours !== null) {
            updateData.closingEngineHours = validHours;
        }

        const fault = await Fault.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            updateData,
            { new: true, runValidators: true }
        ).populate('tool operator');

        if (!fault) {
            return res.status(404).json({ message: 'Fault not found' });
        }

        // If closing engine hours were reported, update the equipment's currentEngineHours and recalculate schedule
        if (fault.tool && validHours !== null) {
            const toolDoc = await Tool.findOne({ _id: fault.tool._id || fault.tool, companyId: req.user.companyId });
            if (toolDoc) {
                if (validHours > (toolDoc.currentEngineHours || 0)) {
                    toolDoc.currentEngineHours = validHours;
                }
                if (toolDoc.maintenanceSchedule?.length > 0) {
                    toolDoc.maintenanceSchedule.forEach(task => {
                        if (task.intervalHours > 0) {
                            const hoursRemaining = (task.nextDueHours || task.intervalHours) - toolDoc.currentEngineHours;
                            if (hoursRemaining <= 0) {
                                task.status = 'overdue';
                            } else if (hoursRemaining <= 20) {
                                task.status = 'due_soon';
                            } else {
                                task.status = 'normal';
                            }
                        }
                    });
                }
                await toolDoc.save();
            }
        }

        res.json(fault);
    } catch (err) {
        next(err);
    }
};

exports.reopenFault = async (req, res, next) => {
    try {
        const fault = await Fault.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            {
                status: 'open',
                $unset: { closedAt: 1, closingEngineHours: 1 },
            },
            { new: true, runValidators: true }
        ).populate('tool operator');

        if (!fault) {
            return res.status(404).json({ message: 'Fault not found' });
        }

        res.json(fault);
    } catch (err) {
        next(err);
    }
};

exports.deleteFault = async (req, res, next) => {
    try {
        const fault = await Fault.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user.companyId,
        });

        if (!fault) {
            return res.status(404).json({ message: 'Fault not found' });
        }

        if (fault.tool) {
            await Tool.findOneAndUpdate(
                { _id: fault.tool, companyId: req.user.companyId },
                { $pull: { faults: fault._id } }
            );
        }

        res.json({ message: 'Fault deleted successfully' });
    } catch (err) {
        next(err);
    }
};