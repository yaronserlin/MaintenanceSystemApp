// src/components/Fault/CloseFaultDialog/CloseFaultDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Chip,
    Alert,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';

export default function CloseFaultDialog({ open, onClose, onConfirm, fault, tool, equipment }) {
    const activeEquipment = equipment || tool;
    const lastReportedHours = activeEquipment?.currentEngineHours ?? fault?.engineHours ?? 0;
    const [engineHours, setEngineHours] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setEngineHours(lastReportedHours ? String(lastReportedHours) : '');
            setError('');
        }
    }, [open, lastReportedHours]);

    const handleConfirm = () => {
        const val = parseFloat(engineHours);
        if (isNaN(val) || val < 0) {
            setError('Please enter a valid non-negative engine hours reading.');
            return;
        }
        if (val < lastReportedHours) {
            setError(`Entered hours (${val} hrs) cannot be less than last reported reading (${lastReportedHours} hrs).`);
            return;
        }

        setError('');
        onConfirm(fault, val);
    };

    if (!fault) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>Close Fault & Update Engine Hours</DialogTitle>
            <DialogContent dividers>
                <Box mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {fault.code || 'Fault'} — {fault.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Equipment: {activeEquipment?.name || fault.tool?.name || 'Equipment'}
                    </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2.5 }}>
                    Closing this fault requires recording the current engine operating hours to update equipment maintenance schedules.
                </Alert>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <TextField
                        label="Current Engine Hours"
                        type="number"
                        inputProps={{ min: lastReportedHours, step: 'any' }}
                        value={engineHours}
                        onChange={(e) => {
                            setEngineHours(e.target.value);
                            setError('');
                        }}
                        error={Boolean(error)}
                        helperText={error || 'Enter current meter reading at completion'}
                        sx={{ flex: 1, minWidth: 200 }}
                        required
                    />

                    <Chip
                        icon={<SpeedIcon />}
                        label={`Last reported: ${lastReportedHours} hrs`}
                        color="secondary"
                        variant="outlined"
                        sx={{ fontWeight: 500, height: 40, px: 1 }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="success"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
