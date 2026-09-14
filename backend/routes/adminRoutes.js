// routes/adminRoutes.js
const express = require('express');
const { verifyToken, ensureAdmin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
    getAllUsers,
    createUser,
    updateUserRole,
    deleteUser,
} = require('../controllers/userController');
const {
    getAllTools,
    createTool,
    updateTool,
    deleteTool,
} = require('../controllers/toolController');

const router = express.Router();

// Apply auth + admin check to every /api/admin/* route
router.use(verifyToken, ensureAdmin);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id/role', validateObjectId('id'), updateUserRole);
router.delete('/users/:id', validateObjectId('id'), deleteUser);

// Equipment management
router.get('/equipment', getAllTools);
router.post('/equipment', createTool);
router.put('/equipment/:id', validateObjectId('id'), updateTool);
router.delete('/equipment/:id', validateObjectId('id'), deleteTool);

// Tool management (backward-compatible aliases)
router.get('/tools', getAllTools);
router.post('/tools', createTool);
router.put('/tools/:id', validateObjectId('id'), updateTool);
router.delete('/tools/:id', validateObjectId('id'), deleteTool);

module.exports = router;
