// routes/faultRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    getAllFaults,
    getFaultById,
    createFault,
    closeFault,
} = require('../controllers/faultController');

router.get('/', auth, getAllFaults);
router.get('/:id', auth, getFaultById);
router.post('/', auth, upload.array('photos'), createFault);
router.patch('/:id/close', auth, closeFault);

module.exports = router;