// src/components/CreateFaultDialog.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { CreateFaultForm } from '../FaultForms/FaultForms';


export default function CreateFaultDialog({ open, onClose, onSubmit, toolId, equipmentId }) {
    const activeEquipmentId = equipmentId || toolId;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Report New Fault</DialogTitle>
            <DialogContent dividers>
                <CreateFaultForm
                    onSubmit={onSubmit}
                    toolId={activeEquipmentId}
                    equipmentId={activeEquipmentId}
                    formId="create-fault-modal-form"
                    hideSubmitButton={true}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="create-fault-modal-form"
                    variant="contained"
                    color="primary"
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}