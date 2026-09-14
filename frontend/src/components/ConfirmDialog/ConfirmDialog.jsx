import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

/**
 * Reusable modal dialog replacing native window.confirm and alert prompts.
 */
export default function ConfirmDialog({
    open,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'primary',
    onConfirm,
    onCancel,
}) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            aria-labelledby="confirm-dialog-title"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent dividers>
                <DialogContentText color="text.primary">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5 }}>
                <Button onClick={onCancel} color="inherit">
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={confirmColor}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
