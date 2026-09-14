// routes/partRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
    getAllParts,
    createPart,
    updatePart,
    deletePart,
} = require('../controllers/partController');

router.use(verifyToken);

router.get('/', getAllParts);
router.post('/', createPart);
router.put('/:id', validateObjectId('id'), updatePart);
router.delete('/:id', validateObjectId('id'), deletePart);

module.exports = router;