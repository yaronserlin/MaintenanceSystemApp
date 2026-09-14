// routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, ensureAdmin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
    getAllTools,
    getToolById,
    createTool,
    updateTool,
    deleteTool,
} = require('../controllers/toolController');

router.use(verifyToken);

router.get('/', getAllTools);
router.get('/:id', validateObjectId('id'), getToolById);

// Critical #2 Fix: require ensureAdmin on mutation routes
router.post('/', ensureAdmin, createTool);
router.put('/:id', validateObjectId('id'), ensureAdmin, updateTool);
router.delete('/:id', validateObjectId('id'), ensureAdmin, deleteTool);

module.exports = router;