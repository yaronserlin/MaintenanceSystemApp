import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

/**
 * In-app PDF document viewer dialog so users never have to leave the application.
 */
export default function PdfViewerDialog({ open, onClose, title, fileUrl }) {
    if (!fileUrl) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { minHeight: '80vh' } }}
            aria-labelledby="pdf-viewer-dialog-title"
        >
            <DialogTitle
                component="div"
                id="pdf-viewer-dialog-title"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 3,
                }}
            >
                <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '75%' }}>
                    {title || 'Document Manual'}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={fileUrl}
                        download
                    >
                        Download
                    </Button>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, height: '70vh', overflow: 'hidden' }}>
                <Box
                    component="iframe"
                    src={fileUrl}
                    title={title || 'PDF Document'}
                    sx={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1 }}>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
