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
    onDelete,
    submitButtonText = 'Submit',
    cancelButtonText = 'Cancel',
    deleteButtonText = 'Delete',
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
            <DialogActions sx={{ justifyContent: onDelete ? 'space-between' : 'flex-end', px: 3, py: 1.5 }}>
                {onDelete ? (
                    <Button onClick={onDelete} color="error" variant="outlined">
                        {deleteButtonText}
                    </Button>
                ) : null}
                <div>
                    <Button onClick={onClose} sx={{ mr: 1 }}>{cancelButtonText}</Button>
                    {onSubmit && (
                        <Button onClick={onSubmit} variant="contained" color="primary">
                            {submitButtonText}
                        </Button>
                    )}
                </div>
            </DialogActions>
        </Dialog>
    );
}