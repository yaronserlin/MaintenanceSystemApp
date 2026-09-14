// middleware/validationMiddleware.js
const mongoose = require('mongoose');

exports.validateObjectId = (...paramNames) => {
    const params = paramNames.length > 0 ? paramNames : ['id'];
    return (req, res, next) => {
        for (const param of params) {
            const id = req.params[param];
            if (!id || !mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: `Invalid ${param} format` });
            }
        }
        next();
    };
};
