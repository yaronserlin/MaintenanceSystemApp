// routes/partRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllParts,
  createPart,
  updatePart,
  deletePart,
} = require('../controllers/partController');

router.get('/', auth, getAllParts);
router.post('/', auth, createPart);
router.put('/:id', auth, updatePart);
router.delete('/:id', auth, deletePart);

module.exports = router;