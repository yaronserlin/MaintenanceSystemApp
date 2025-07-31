import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

export default function DialogComponent({
    open,
    onClose,
    title,
    children,
    onSubmit,
    submitButtonText = 'Submit',
    cancelButtonText = 'Cancel',
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{cancelButtonText}</Button>
                {onSubmit && <Button onClick={onSubmit} color="primary">
                    {submitButtonText}
                </Button>}
            </DialogActions>
        </Dialog>
    );
}