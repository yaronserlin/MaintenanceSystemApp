// routes/faultRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    getAllFaults,
    getFaultById,
    createFault,
    closeFault,
    deleteFault
} = require('../controllers/faultController');

router.get('/', verifyToken, getAllFaults);
router.get('/:id', verifyToken, getFaultById);
router.post('/', verifyToken, upload.array('photos'), createFault);
router.patch('/:id/close', verifyToken, closeFault);
router.delete('/:id', verifyToken, deleteFault);

module.exports = router;