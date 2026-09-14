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
    updateScheduleProgress,
} = require('../controllers/equipmentController');

router.use(verifyToken);

router.get('/', getAllTools);
router.get('/:id', validateObjectId('id'), getToolById);

// Require ensureAdmin on mutation routes
router.post('/', ensureAdmin, createTool);
router.put('/:id', validateObjectId('id'), ensureAdmin, updateTool);
router.delete('/:id', validateObjectId('id'), ensureAdmin, deleteTool);

// Equipment Books (PDFs)
router.post('/:id/books', validateObjectId('id'), ensureMechanicOrAdmin, upload.single('book'), addBook);
router.delete('/:id/books/:bookId', validateObjectId('id', 'bookId'), ensureMechanicOrAdmin, deleteBook);

// Equipment Maintenance Schedules
router.post('/:id/schedules', validateObjectId('id'), ensureMechanicOrAdmin, addSchedule);
router.get('/:id/schedules/:scheduleId', validateObjectId('id', 'scheduleId'), getSchedule);
router.delete('/:id/schedules/:scheduleId', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, deleteSchedule);
router.post('/:id/schedules/:scheduleId/complete', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, completeSchedule);
router.patch('/:id/schedules/:scheduleId/progress', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, updateScheduleProgress);
router.put('/:id/schedules/:scheduleId/progress', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, updateScheduleProgress);
router.post('/:id/schedules/:scheduleId/progress', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, updateScheduleProgress);

// Schedule Checklist (Todo List) items
router.post('/:id/schedules/:scheduleId/checklist', validateObjectId('id', 'scheduleId'), ensureMechanicOrAdmin, addChecklistItem);
router.patch('/:id/schedules/:scheduleId/checklist/:itemId', validateObjectId('id', 'scheduleId', 'itemId'), ensureMechanicOrAdmin, toggleChecklistItem);
router.delete('/:id/schedules/:scheduleId/checklist/:itemId', validateObjectId('id', 'scheduleId', 'itemId'), ensureMechanicOrAdmin, deleteChecklistItem);

module.exports = router;
