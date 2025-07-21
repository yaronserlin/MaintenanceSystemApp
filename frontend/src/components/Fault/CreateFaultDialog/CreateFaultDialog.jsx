// src/components/CreateFaultDialog.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { CreateFaultForm } from '../FaultForms/FaultForms';


export default function CreateFaultDialog({ open, onClose, onSubmit, toolId }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create Fault</DialogTitle>
            <DialogContent dividers>


                <CreateFaultForm onSubmit={onSubmit} toolId={toolId} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}