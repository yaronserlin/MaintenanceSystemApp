import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    Typography,
    Chip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getMediaUrl } from '../../../utils/mediaUtils';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmDialog from '../../ConfirmDialog/ConfirmDialog';
import ImageViewerDialog from '../../ImageViewer/ImageViewerDialog';

export default function FaultDetailsDialog({
    open,
    onClose,
    fault,
    onDeleteFault,
    onCloseFault,
    onReopenFault,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuth();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(null);
    const canManage = user && (user.role === 'admin' || user.role === 'mechanic');

    const handleConfirmDelete = () => {
        setConfirmDeleteOpen(false);
        onDeleteFault?.(fault);
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
                <DialogTitle
                    component="div"
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
                >
                    <Typography variant="h6" component="div" fontWeight="bold">Fault Details</Typography>
                    {fault?.status && (
                        <Chip
                            icon={fault.status === 'open' ? <WarningAmberIcon /> : <CheckCircleIcon />}
                            label={fault.status === 'open' ? 'Open Fault' : 'Resolved'}
                            color={fault.status === 'open' ? 'error' : 'success'}
                            size="small"
                        />
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {fault && (
                        <List disablePadding>
                            <ListItem disableGutters>
                                <ListItemText primary="Fault Code" secondary={fault.code || 'N/A'} />
                            </ListItem>
                            <ListItem disableGutters>
                                <ListItemText primary="Description" secondary={fault.description} />
                            </ListItem>

                            {fault.engineHours !== undefined && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Reported Engine Hours"
                                        secondary={
                                            <Chip
                                                icon={<SpeedIcon />}
                                                label={`${fault.engineHours} hrs`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mt: 0.5 }}
                                            />
                                        }
                                    />
                                </ListItem>
                            )}

                            {fault.closingEngineHours !== undefined && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Closing Engine Hours"
                                        secondary={
                                            <Chip
                                                icon={<SpeedIcon />}
                                                label={`${fault.closingEngineHours} hrs`}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ mt: 0.5 }}
                                            />
                                        }
                                    />
                                </ListItem>
                            )}

                            <ListItem disableGutters>
                                <ListItemText
                                    primary="Reported By"
                                    secondary={fault.operator?.name || fault.operator || 'N/A'}
                                />
                            </ListItem>

                            <ListItem disableGutters>
                                <ListItemText
                                    primary="Reported At"
                                    secondary={new Date(fault.createdAt).toLocaleString('en-GB')}
                                />
                            </ListItem>

                            {fault.status === 'closed' && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Closed At"
                                        secondary={
                                            fault.closedAt ? new Date(fault.closedAt).toLocaleString('en-GB') : 'N/A'
                                        }
                                    />
                                </ListItem>
                            )}

                            {fault.photos?.length > 0 && (
                                <ListItem disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        Photos ({fault.photos.length}):
                                    </Typography>
                                    <Box display="flex" gap={1.5} flexWrap="wrap">
                                        {fault.photos.map((photo, idx) => (
                                            <Box
                                                key={idx}
                                                component="button"
                                                type="button"
                                                onClick={() => setViewerIndex(idx)}
                                                aria-label={`View photo ${idx + 1}`}
                                                sx={{
                                                    all: 'unset',
                                                    cursor: 'pointer',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #ccc',
                                                    display: 'block',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.04)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    },
                                                    '&:focus-visible': {
                                                        outline: '2px solid #1976d2',
                                                        outlineOffset: '2px',
                                                    },
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={getMediaUrl(photo)}
                                                    alt={`Photo ${idx + 1}`}
                                                    sx={{ width: 90, height: 90, objectFit: 'cover', display: 'block' }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </ListItem>
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 1.5 }}>
                    {canManage && onDeleteFault ? (
                        <Button
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => setConfirmDeleteOpen(true)}
                        >
                            Delete
                        </Button>
                    ) : <Box />}

                    <Box display="flex" gap={1}>
                        {canManage && fault?.status === 'closed' && onReopenFault && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    onClose();
                                    onReopenFault(fault);
                                }}
                            >
                                Reopen
                            </Button>
                        )}
                        {canManage && fault?.status === 'open' && onCloseFault && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    onClose();
                                    onCloseFault(fault);
                                }}
                                sx={{ fontWeight: 700 }}
                            >
                                Resolve Fault
                            </Button>
                        )}
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            color="inherit"
                            sx={{
                                color: 'text.secondary',
                                borderColor: 'divider',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: 'text.primary',
                                    color: 'text.primary',
                                },
                            }}
                        >
                            Dismiss
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                title="Confirm Delete"
                message="Are you sure you want to delete this fault?"
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="error"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
            />

            {/* In-App Image Viewer Dialog */}
            <ImageViewerDialog
                open={viewerIndex !== null}
                onClose={() => setViewerIndex(null)}
                images={fault?.photos || []}
                initialIndex={viewerIndex ?? 0}
                title={`Fault ${fault?.code || ''} Photo`}
            />
        </>
    );
}