// middleware/validationMiddleware.js
const mongoose = require('mongoose');

exports.validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: `Invalid ${paramName} format` });
        }
        next();
    };
};
