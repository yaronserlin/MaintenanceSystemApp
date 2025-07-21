// routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getAllTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
} = require('../controllers/toolController');

router.get('/', verifyToken, getAllTools);
router.get('/:id', verifyToken, getToolById);
router.post('/', verifyToken, createTool);
router.put('/:id', verifyToken, updateTool);
router.delete('/:id', verifyToken, deleteTool);

module.exports = router;