// routes/partRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, ensureMechanicOrAdmin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
    getAllParts,
    createPart,
    updatePart,
    deletePart,
} = require('../controllers/partController');

router.use(verifyToken);

router.get('/', getAllParts);
router.post('/', ensureMechanicOrAdmin, createPart);
router.put('/:id', validateObjectId('id'), ensureMechanicOrAdmin, updatePart);
router.delete('/:id', validateObjectId('id'), ensureMechanicOrAdmin, deletePart);

module.exports = router;