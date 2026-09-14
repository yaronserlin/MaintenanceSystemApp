import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotify } from '../../../contexts/NotificationContext';
import equipmentService from '../../../services/equipmentService';
import ConfirmDialog from '../../ConfirmDialog/ConfirmDialog';

export default function EquipmentMaintenanceTab({ equipment, tool, onRefresh }) {
    const eq = equipment || tool;
    const navigate = useNavigate();
    const { user } = useAuth();
    const notify = useNotify();
    const isAdmin = user?.role === 'admin';
    const canManage = user?.role === 'admin' || user?.role === 'mechanic';

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Delete confirmation state
    const [deletingScheduleId, setDeletingScheduleId] = useState(null);

    const [scheduleForm, setScheduleForm] = useState({
        title: '',
        description: '',
        intervalHours: '',
        intervalDays: '',
    });

    const [scheduleChecklist, setScheduleChecklist] = useState([]);
    const [checklistInput, setChecklistInput] = useState('');

    const [completionData, setCompletionData] = useState({
        currentEngineHours: '',
        notes: '',
    });

    const schedules = eq?.maintenanceSchedule || [];
    const currentHours = eq?.currentEngineHours || 0;

    const handleOpenAddDialog = () => {
        setScheduleForm({
            title: '',
            description: '',
            intervalHours: '',
            intervalDays: '',
        });
        setScheduleChecklist([]);
        setChecklistInput('');
        setAddDialogOpen(true);
    };

    const handleAddChecklistItem = () => {
        if (!checklistInput.trim()) return;
        setScheduleChecklist((prev) => [...prev, checklistInput.trim()]);
        setChecklistInput('');
    };

    const handleRemoveChecklistItem = (index) => {
        setScheduleChecklist((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!scheduleForm.title.trim() || !eq?._id) return;

        const finalChecklist = [...scheduleChecklist];
        if (checklistInput.trim()) {
            finalChecklist.push(checklistInput.trim());
        }

        try {
            await equipmentService.addSchedule(eq._id, {
                title: scheduleForm.title.trim(),
                description: scheduleForm.description.trim(),
                intervalHours: scheduleForm.intervalHours ? parseInt(scheduleForm.intervalHours, 10) : 0,
                intervalDays: scheduleForm.intervalDays ? parseInt(scheduleForm.intervalDays, 10) : 0,
                checklist: finalChecklist,
            });
            notify.success('Maintenance schedule added');
            setAddDialogOpen(false);
            setScheduleChecklist([]);
            setChecklistInput('');
            onRefresh?.();
        } catch (err) {
            console.error('Add schedule error:', err);
            notify.error('Failed to add maintenance schedule');
        }
    };

    const handleConfirmDeleteSchedule = async () => {
        if (!deletingScheduleId || !eq?._id) return;
        try {
            await equipmentService.deleteSchedule(eq._id, deletingScheduleId);
            notify.success('Maintenance schedule removed');
            setDeletingScheduleId(null);
            onRefresh?.();
        } catch (err) {
            console.error('Delete schedule error:', err);
            notify.error('Failed to delete maintenance schedule');
            setDeletingScheduleId(null);
        }
    };

    const handleOpenCompleteDialog = (task) => {
        setSelectedTask(task);
        setCompletionData({
            currentEngineHours: String(currentHours),
            notes: '',
        });
        setCompleteDialogOpen(true);
    };

    const handleConfirmComplete = async (e) => {
        e.preventDefault();
        if (!selectedTask || !eq?._id) return;

        try {
            await equipmentService.completeSchedule(eq._id, selectedTask._id, {
                currentEngineHours: completionData.currentEngineHours
                    ? parseFloat(completionData.currentEngineHours)
                    : currentHours,
                notes: completionData.notes,
            });
            notify.success('Service logged and schedule updated');
            setCompleteDialogOpen(false);
            setSelectedTask(null);
            onRefresh?.();
        } catch (err) {
            console.error('Complete schedule error:', err);
            notify.error('Failed to log completed maintenance');
        }
    };

    const getStatusChip = (task) => {
        let status = task.status || 'normal';
        let remainingHours = null;

        if (task.intervalHours > 0) {
            const nextDue = task.nextDueHours || (task.lastPerformedHours || 0) + task.intervalHours;
            remainingHours = nextDue - currentHours;
            if (remainingHours <= 0) {
                status = 'overdue';
            } else if (remainingHours <= 20) {
                status = 'due_soon';
            }
        }

        if (status === 'overdue') {
            return (
                <Chip
                    label={remainingHours !== null ? `OVERDUE (${Math.abs(remainingHours)} hrs)` : 'OVERDUE'}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            );
        }
        if (status === 'due_soon') {
            return (
                <Chip
                    label={remainingHours !== null ? `DUE SOON (${remainingHours} hrs)` : 'DUE SOON'}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            );
        }
        return (
            <Chip
                label={remainingHours !== null ? `NORMAL (${remainingHours} hrs left)` : 'NORMAL'}
                color="success"
                size="small"
                variant="outlined"
            />
        );
    };

    return (
        <Box sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Typography variant="h6">Maintenance Schedules</Typography>
                    <Chip
                        icon={<SpeedIcon />}
                        label={`Current Meter: ${currentHours} hrs`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                    >
                        Add
                    </Button>
                )}
            </Box>

            {schedules.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No scheduled maintenance tasks configured for this equipment yet.
                    {isAdmin && ' Click "+ Add" above to set up periodic service routines.'}
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {schedules.map((task) => (
                        <Grid size={{ xs: 12, md: 6 }} key={task._id}>
                            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <CardActionArea
                                    onClick={() => navigate(`/equipment/${eq._id}/schedules/${task._id}`)}
                                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', textAlign: 'left' }}
                                >
                                    <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                sx={{
                                                    flex: '1 1 180px',
                                                    minWidth: 0,
                                                    wordBreak: 'break-word',
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {task.title}
                                            </Typography>
                                            <Box sx={{ flexShrink: 0, display: 'inline-flex' }}>
                                                {getStatusChip(task)}
                                            </Box>
                                        </Box>
                                        {task.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                                {task.description}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Frequency: {task.intervalHours > 0 ? `Every ${task.intervalHours} engine hours` : ''}
                                            {task.intervalHours > 0 && task.intervalDays > 0 ? ' or ' : ''}
                                            {task.intervalDays > 0 ? `Every ${task.intervalDays} days` : ''}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Last performed: {task.lastPerformedHours ?? 0} hrs
                                            {task.lastPerformedDate ? ` on ${new Date(task.lastPerformedDate).toLocaleDateString('en-GB')}` : ''}
                                        </Typography>
                                        {task.nextDueHours > 0 && (
                                            <Typography variant="caption" display="block" fontWeight="medium" color="primary">
                                                Next due reading: {task.nextDueHours} hrs
                                            </Typography>
                                        )}
                                        {task.checklist && task.checklist.length > 0 && (
                                            <Box mt={1.5}>
                                                <Chip
                                                    size="small"
                                                    icon={<ChecklistIcon fontSize="small" />}
                                                    label={`Checklist: ${task.checklist.filter(c => c.done).length}/${task.checklist.length} done`}
                                                    variant="outlined"
                                                    color={task.checklist.every(c => c.done) ? 'success' : 'default'}
                                                />
                                                <Box mt={1} sx={{ pl: 0.5 }}>
                                                    {task.checklist.slice(0, 3).map((item, idx) => (
                                                        <Typography
                                                            key={item._id || idx}
                                                            variant="caption"
                                                            color={item.done ? 'text.secondary' : 'text.primary'}
                                                            sx={{
                                                                display: 'block',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                textDecoration: item.done ? 'line-through' : 'none',
                                                            }}
                                                        >
                                                            • {item.text}
                                                        </Typography>
                                                    ))}
                                                    {task.checklist.length > 3 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>
                                                            +{task.checklist.length - 3} more tasks
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
                                    {canManage ? (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="success"
                                            startIcon={<CheckCircleOutlineIcon />}
                                            onClick={() => handleOpenCompleteDialog(task)}
                                        >
                                            Complete
                                        </Button>
                                    ) : <Box />}

                                    {isAdmin && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            title="Delete"
                                            onClick={() => setDeletingScheduleId(task._id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Delete Schedule Confirmation Dialog */}
            <ConfirmDialog
                open={Boolean(deletingScheduleId)}
                title="Confirm Delete"
                message="Are you sure you want to permanently delete this maintenance schedule?"
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="error"
                onConfirm={handleConfirmDeleteSchedule}
                onCancel={() => setDeletingScheduleId(null)}
            />

            {/* Add Maintenance Schedule Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Maintenance Routine</DialogTitle>
                <Box component="form" onSubmit={handleAddScheduleSubmit}>
                    <DialogContent dividers>
                        <TextField
                            label="Routine Title"
                            fullWidth
                            required
                            placeholder="e.g. 250hr Engine Oil & Filter Service"
                            value={scheduleForm.title}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Description / Tasks (optional)"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Drain oil, replace filter element, check air filter"
                            value={scheduleForm.description}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Interval (Engine Hours)"
                                    type="number"
                                    fullWidth
                                    placeholder="e.g. 250"
                                    inputProps={{ min: 0 }}
                                    value={scheduleForm.intervalHours}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, intervalHours: e.target.value })}
                                    helperText="Set to 0 if only calendar based"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Interval (Calendar Days)"
                                    type="number"
                                    fullWidth
                                    placeholder="e.g. 30"
                                    inputProps={{ min: 0 }}
                                    value={scheduleForm.intervalDays}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, intervalDays: e.target.value })}
                                    helperText="Set to 0 if only engine hours based"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2.5 }} />
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            To-Do Checklist Tasks ({scheduleChecklist.length})
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                            Add the specific inspection and service tasks for this routine. Mechanics will check them off when performing maintenance.
                        </Typography>

                        <Box display="flex" gap={1} mb={1.5}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="e.g. Inspect hydraulic fluid level and top up if needed"
                                value={checklistInput}
                                onChange={(e) => setChecklistInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddChecklistItem();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddChecklistItem();
                                }}
                                disabled={!checklistInput.trim()}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                Add Task
                            </Button>
                        </Box>

                        {scheduleChecklist.length > 0 && (
                            <List dense sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 0.5, maxHeight: 180, overflowY: 'auto' }}>
                                {scheduleChecklist.map((taskText, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                color="error"
                                                title="Remove"
                                                onClick={() => handleRemoveChecklistItem(index)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={`${index + 1}. ${taskText}`}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Add
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Log / Complete Service Dialog */}
            <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Log Completed Service</DialogTitle>
                <Box component="form" onSubmit={handleConfirmComplete}>
                    <DialogContent dividers>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {selectedTask?.title}
                        </Typography>
                        <TextField
                            label="Current Engine Hours at Service"
                            type="number"
                            fullWidth
                            required
                            inputProps={{ min: currentHours, step: 'any' }}
                            value={completionData.currentEngineHours}
                            onChange={(e) => setCompletionData({ ...completionData, currentEngineHours: e.target.value })}
                            helperText={`Current equipment reading: ${currentHours} hrs`}
                            sx={{ mb: 2, mt: 1 }}
                        />
                        <TextField
                            label="Service Notes / Parts Used (optional)"
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Replaced filter part #X, 15W40 oil filled, tested OK"
                            value={completionData.notes}
                            onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" color="success">
                            Complete
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
