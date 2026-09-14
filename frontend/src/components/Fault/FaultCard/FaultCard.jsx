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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

    const equipmentName = fault.tool?.name || (typeof fault.tool === 'string' ? '' : '');

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 6px 16px rgba(0,0,0,0.5)'
                        : '0 6px 16px rgba(0,0,0,0.08)',
                },
            }}
        >
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
                        '&:hover': { opacity: 0.88 },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setViewerOpen(true);
                    }}
                    title="Click to view full photo"
                />
            )}
            <CardActionArea onClick={() => onClick(fault)} sx={{ flexGrow: 1 }}>
                <CardContent sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight="bold">
                            {fault.code || 'Fault'}
                        </Typography>
                        <Chip
                            icon={fault.status === 'closed' ? <CheckCircleIcon /> : <WarningAmberIcon />}
                            label={fault.status === 'closed' ? 'Closed' : 'Open'}
                            size="small"
                            color={fault.status === 'closed' ? 'success' : 'error'}
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>

                    {equipmentName && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Equipment: {equipmentName}
                        </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 38, lineHeight: 1.4 }}>
                        {fault.description}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        {hours !== undefined && (
                            <Chip
                                icon={<SpeedIcon sx={{ fontSize: '1rem !important' }} />}
                                label={`${hours} hrs`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.75rem' }}
                            />
                        )}

                        <Typography variant="caption" color="text.secondary">
                            Reported: {new Date(fault.createdAt).toLocaleDateString('en-GB')}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>

            {user && (user.role === 'admin' || user.role === 'mechanic') && (
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5, pt: 0.5 }}>
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
