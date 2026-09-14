// routes/faultRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, ensureMechanicOrAdmin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getAllFaults,
    getFaultById,
    createFault,
    closeFault,
    deleteFault,
} = require('../controllers/faultController');

router.use(verifyToken);

router.get('/', getAllFaults);
router.get('/:id', validateObjectId('id'), getFaultById);
router.post('/', upload.array('photos', 5), createFault);

// Role check: only mechanics or admins can close or delete faults
router.patch('/:id/close', validateObjectId('id'), ensureMechanicOrAdmin, closeFault);
router.delete('/:id', validateObjectId('id'), ensureMechanicOrAdmin, deleteFault);

module.exports = router;