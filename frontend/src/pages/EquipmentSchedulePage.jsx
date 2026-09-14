// src/pages/EquipmentSchedulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../contexts/AuthContext';
import { useNotify } from '../contexts/NotificationContext';
import equipmentService from '../services/equipmentService';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';

export default function EquipmentSchedulePage() {
    const { id, scheduleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const notify = useNotify();

    const [equipment, setEquipment] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [completionData, setCompletionData] = useState({
        currentEngineHours: '',
        notes: '',
    });

    const canManage = user?.role === 'admin' || user?.role === 'mechanic';

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await equipmentService.getSchedule(id, scheduleId);
            setEquipment(data.equipment);
            setSchedule(data.schedule);
        } catch (err) {
            console.error('Error loading schedule:', err);
            setError(err.response?.data?.message || 'Failed to load maintenance schedule');
        } finally {
            setLoading(false);
        }
    }, [id, scheduleId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleTask = async (itemId) => {
        if (!canManage) return;
        try {
            const data = await equipmentService.toggleChecklistItem(id, scheduleId, itemId);
            setEquipment(data.equipment);
            setSchedule(data.schedule);
        } catch (err) {
            console.error('Error toggling task:', err);
            notify.error('Failed to update task status');
        }
    };

    const handleOpenCompleteDialog = () => {
        const currentHours = equipment?.currentEngineHours || 0;
        setCompletionData({
            currentEngineHours: String(currentHours),
            notes: '',
        });
        setCompleteDialogOpen(true);
    };

    const handleConfirmComplete = async (e) => {
        e.preventDefault();
        try {
            const currentHours = equipment?.currentEngineHours || 0;
            await equipmentService.completeSchedule(id, scheduleId, {
                currentEngineHours: completionData.currentEngineHours
                    ? parseFloat(completionData.currentEngineHours)
                    : currentHours,
                notes: completionData.notes,
            });
            notify.success('Service logged and schedule updated');
            setCompleteDialogOpen(false);
            loadData();
        } catch (err) {
            console.error('Complete schedule error:', err);
            notify.error('Failed to log completed maintenance');
        }
    };

    if (loading) return <LoadingComponent />;
    if (error) return <ErrorComponent message={error} />;
    if (!schedule || !equipment) return <Typography>Schedule not found.</Typography>;

    const checklist = schedule.checklist || [];
    const completedCount = checklist.filter((item) => item.done).length;
    const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;
    const currentHours = equipment.currentEngineHours || 0;

    return (
        <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
            {/* Navigation back */}
            <Box mb={2}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/equipment/${id}`)}
                    color="inherit"
                >
                    Back to {equipment.name}
                </Button>
            </Box>

            {/* Schedule Header Card */}
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={1}>
                        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ wordBreak: 'break-word' }}>
                                {schedule.title}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                Equipment: {equipment.name} (Serial: {equipment.localSerialNumber || equipment.serialNumber || 'N/A'})
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1} alignItems="center">
                            <Chip
                                icon={<SpeedIcon />}
                                label={`Meter: ${currentHours} hrs`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                label={(schedule.status || 'NORMAL').toUpperCase()}
                                color={schedule.status === 'overdue' ? 'error' : (schedule.status === 'due_soon' ? 'warning' : 'success')}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                    </Box>

                    {schedule.description && (
                        <Typography variant="body1" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
                            {schedule.description}
                        </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" gap={3} flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                            Frequency: {schedule.intervalHours > 0 ? `Every ${schedule.intervalHours} engine hours` : ''}
                            {schedule.intervalHours > 0 && schedule.intervalDays > 0 ? ' or ' : ''}
                            {schedule.intervalDays > 0 ? `Every ${schedule.intervalDays} days` : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Last performed: {schedule.lastPerformedHours ?? 0} hrs
                            {schedule.lastPerformedDate ? ` on ${new Date(schedule.lastPerformedDate).toLocaleDateString('en-GB')}` : ''}
                        </Typography>
                        {schedule.nextDueHours > 0 && (
                            <Typography variant="caption" fontWeight="bold" color="primary">
                                Next due at: {schedule.nextDueHours} hrs
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Todo List / Checklist Section */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Maintenance Checklist / To-Do List
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {checklist.length === 0
                                ? 'No tasks added yet. Add tasks below to build this maintenance routine.'
                                : `${completedCount} of ${checklist.length} tasks completed (${progressPercent}%)`}
                        </Typography>
                    </Box>

                    {canManage && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={handleOpenCompleteDialog}
                        >
                            Complete
                        </Button>
                    )}
                </Box>

                {checklist.length > 0 && (
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{ height: 8, borderRadius: 4, mb: 3 }}
                    />
                )}

                {checklist.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        No to-do tasks configured for this maintenance schedule.
                    </Typography>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {checklist.map((item) => (
                            <ListItem
                                key={item._id}
                                dense
                                button={canManage}
                                onClick={() => handleToggleTask(item._id)}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    border: '1px solid #f0f0f0',
                                    '&:hover': { bgcolor: '#fafafa' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={Boolean(item.done)}
                                        tabIndex={-1}
                                        disableRipple
                                        disabled={!canManage}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        sx: {
                                            textDecoration: item.done ? 'line-through' : 'none',
                                            color: item.done ? 'text.secondary' : 'text.primary',
                                            fontWeight: item.done ? 'normal' : 500,
                                        },
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            {/* Complete Service Dialog */}
            <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Log Completed Service</DialogTitle>
                <Box component="form" onSubmit={handleConfirmComplete}>
                    <DialogContent dividers>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {schedule.title}
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
        </Container>
    );
}
