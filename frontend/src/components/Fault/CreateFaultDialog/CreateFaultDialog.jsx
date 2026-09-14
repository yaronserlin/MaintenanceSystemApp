// src/components/CreateFaultDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useMediaQuery,
    useTheme,
    IconButton,
    Box,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CreateFaultForm } from '../FaultForms/FaultForms';

export default function CreateFaultDialog({ open, onClose, onSubmit, toolId, equipmentId }) {
    const activeEquipmentId = equipmentId || toolId;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="span" fontWeight="bold">
                    Report New Fault
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                {open && (
                    <CreateFaultForm
                        onSubmit={onSubmit}
                        toolId={activeEquipmentId}
                        equipmentId={activeEquipmentId}
                        formId="create-fault-modal-form"
                        hideSubmitButton={true}
                    />
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} color="inherit" variant="outlined">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="create-fault-modal-form"
                    variant="contained"
                    color="primary"
                >
                    Submit Fault Report
                </Button>
            </DialogActions>
        </Dialog>
    );
}