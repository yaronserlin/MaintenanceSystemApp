// routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
} = require('../controllers/toolController');

router.get('/', auth, getAllTools);
router.get('/:id', auth, getToolById);
router.post('/', auth, createTool);
router.put('/:id', auth, updateTool);
router.delete('/:id', auth, deleteTool);

module.exports = router;