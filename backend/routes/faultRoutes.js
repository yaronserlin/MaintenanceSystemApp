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
    reopenFault,
    deleteFault,
} = require('../controllers/faultController');

router.use(verifyToken);

router.get('/', getAllFaults);
router.get('/:id', validateObjectId('id'), getFaultById);
router.post('/', upload.array('photos', 5), createFault);

// Role check: only mechanics or admins can close, reopen, or delete faults
router.patch('/:id/close', validateObjectId('id'), ensureMechanicOrAdmin, closeFault);
router.put('/:id/reopen', validateObjectId('id'), ensureMechanicOrAdmin, reopenFault);
router.patch('/:id/reopen', validateObjectId('id'), ensureMechanicOrAdmin, reopenFault);
router.delete('/:id', validateObjectId('id'), ensureMechanicOrAdmin, deleteFault);

module.exports = router;