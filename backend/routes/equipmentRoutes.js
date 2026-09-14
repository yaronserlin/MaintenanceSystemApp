// routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, ensureAdmin, ensureMechanicOrAdmin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getAllTools,
    getToolById,
    createTool,
    updateTool,
    deleteTool,
    addBook,
    deleteBook,
    addSchedule,
    deleteSchedule,
    completeSchedule,
    getSchedule,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
} = require('../controllers/equipmentController');

router.use(verifyToken);

router.get('/', getAllTools);
router.get('/:id', validateObjectId('id'), getToolById);

// Require ensureAdmin on mutation routes
router.post('/', ensureAdmin, createTool);
router.put('/:id', validateObjectId('id'), ensureAdmin, updateTool);
router.delete('/:id', validateObjectId('id'), ensureAdmin, deleteTool);

// Equipment Books (PDFs)
router.post('/:id/books', validateObjectId('id'), ensureAdmin, upload.single('book'), addBook);
router.delete('/:id/books/:bookId', validateObjectId('id', 'bookId'), ensureAdmin, deleteBook);

// Equipment Maintenance Schedules
router.post('/:id/schedules', validateObjectId('id'), ensureAdmin, addSchedule);
router.get('/:id/schedules/:scheduleId', validateObjectId('id', 'scheduleId'), getSchedule);
router.delete('/:id/schedules/:scheduleId', validateObjectId('id', 'scheduleId'), ensureAdmin, deleteSchedule);
router.post('/:id/schedules/:scheduleId/complete', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, completeSchedule);

// Schedule Checklist (Todo List) items
router.post('/:id/schedules/:scheduleId/checklist', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, addChecklistItem);
router.patch('/:id/schedules/:scheduleId/checklist/:itemId', validateObjectId('id', 'scheduleId', 'itemId'), ensureMechanicOrAdmin, toggleChecklistItem);
router.delete('/:id/schedules/:scheduleId/checklist/:itemId', validateObjectId('id', 'scheduleId', 'itemId'), ensureMechanicOrAdmin, deleteChecklistItem);

module.exports = router;
