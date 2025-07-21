// routes/partRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getAllParts,
  createPart,
  updatePart,
  deletePart,
} = require('../controllers/partController');

router.get('/', verifyToken, getAllParts);
router.post('/', verifyToken, createPart);
router.put('/:id', verifyToken, updatePart);
router.delete('/:id', verifyToken, deletePart);

module.exports = router;