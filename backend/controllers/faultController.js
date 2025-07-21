// controllers/faultController.js
const Fault = require('../models/Fault');
const Tool = require('../models/Tool');

exports.getAllFaults = async (req, res) => {
    const faults = await Fault.find().populate('tool operator');
    res.json(faults);
};

exports.getFaultById = async (req, res) => {
    const fault = await Fault.findById(req.params.id).populate('tool operator');
    if (!fault) return res.status(404).json({ message: 'Fault not found' });
    res.json(fault);
};

/**
 * Create a new fault and associate it with the tool and the operator.
 */
exports.createFault = async (req, res, next) => {
    try {
        console.log('Creating fault with body:', req.body);

        // Gather photo paths if any were uploaded
        // const photos = req.files ? req.files.map(f => f.path) : [];
        // const photos = req.body.photos || []; // Assuming photos are sent in the request body

        // Create the fault, setting operator from the authenticated user
        const fault = await Fault.create({
            ...req.body,
            operator: req.user.userId,
            photos
        });

        // Push the new fault’s _id into the Tool's faults array
        await Tool.findByIdAndUpdate(
            req.body.tool,
            { $push: { faults: fault._id } },
            { new: true }  // return the updated tool if you need it
        );

        res.status(201).json(fault);
    } catch (err) {
        next(err);
    }
};

// controllers/faultController.js
exports.closeFault = async (req, res) => {
    const fault = await Fault.findByIdAndUpdate(
        req.params.id,
        {
            status: 'closed',
            closedAt: Date.now(),    // ← record the timestamp
        },
        { new: true }
    );
    res.json(fault);
};

/**
 * Delete a fault and disassociate it from its tool.
 *
 * 1. Find the fault to get its associated tool ID.
 * 2. Remove the fault document.
 * 3. Pull the fault ID out of the Tool's faults array.
 * 4. Return a success message.
 */
exports.deleteFault = async (req, res, next) => {
    try {
        const faultId = req.params.id;

        // 1. Find the fault to get its tool reference
        const fault = await Fault.findById(faultId);
        if (!fault) return res.status(404).json({ message: 'Fault not found' });

        // 2. Delete the fault document
        await Fault.findByIdAndDelete(faultId);

        // 3. Remove the fault ID from the Tool's faults array
        await Tool.findByIdAndUpdate(
            fault.tool,
            { $pull: { faults: faultId } }
        );

        // 4. Respond
        res.json({ message: 'Fault deleted successfully' });
    } catch (err) {
        next(err);
    }
};