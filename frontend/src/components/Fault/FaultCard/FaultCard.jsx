import React from 'react';
import {
    Card,
    CardActionArea,
    CardContent,
    CardActions,
    CardMedia,
    Button,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { useAuth } from '../../../contexts/AuthContext';
import { getMediaUrl } from '../../../utils/mediaUtils';
import ImageViewerDialog from '../../ImageViewer/ImageViewerDialog';

export default function FaultCard({ fault, onClick, onCloseFault, onReopenFault, onDeleteFault }) {
    const { user } = useAuth();
    const [viewerOpen, setViewerOpen] = React.useState(false);
    const hasPhoto = fault.photos && fault.photos.length > 0;
    const hours = fault.status === 'closed' && fault.closingEngineHours !== undefined
        ? fault.closingEngineHours
        : fault.engineHours;

    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {hasPhoto && (
                <CardMedia
                    component="img"
                    height="140"
                    image={getMediaUrl(fault.photos[0])}
                    alt={`Photo for ${fault.code || 'fault'}`}
                    sx={{
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 0.9 },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setViewerOpen(true);
                    }}
                    title="Click to view full photo"
                />
            )}
            <CardActionArea onClick={() => onClick(fault)} sx={{ flexGrow: 1 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">{fault.code || 'Fault'}</Typography>
                        <Chip
                            label={fault.status.toUpperCase()}
                            size="small"
                            color={fault.status === 'closed' ? 'success' : 'error'}
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>
                        {fault.description}
                    </Typography>

                    {hours !== undefined && (
                        <Chip
                            icon={<SpeedIcon />}
                            label={`${hours} hrs`}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1 }}
                        />
                    )}

                    <Typography variant="caption" display="block" color="text.secondary">
                        Reported: {new Date(fault.createdAt).toLocaleDateString('en-GB')}
                    </Typography>
                </CardContent>
            </CardActionArea>
            {user && (user.role === 'admin' || user.role === 'mechanic') && (
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
                    <div>
                        {fault.status === 'closed' ? (
                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReopenFault?.(fault);
                                }}
                            >
                                Reopen
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseFault?.(fault);
                                }}
                            >
                                Close
                            </Button>
                        )}
                    </div>
                    {onDeleteFault && (
                        <Button
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFault?.(fault);
                            }}
                        >
                            Delete
                        </Button>
                    )}
                </CardActions>
            )}

            <ImageViewerDialog
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                images={fault.photos || []}
                title={`Fault ${fault.code || ''} Photo`}
            />
        </Card>
    );
}
