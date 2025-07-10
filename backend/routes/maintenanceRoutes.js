// routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    getAllMaintenance,
    createMaintenance,
} = require('../controllers/maintenanceController');

router.get('/', auth, getAllMaintenance);
router.post('/', auth, createMaintenance);

module.exports = router;