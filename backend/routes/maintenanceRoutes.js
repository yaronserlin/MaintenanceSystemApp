// routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    getAllMaintenance,
    createMaintenance,
} = require('../controllers/maintenanceController');

router.get('/', verifyToken, getAllMaintenance);
router.post('/', verifyToken, createMaintenance);

module.exports = router;