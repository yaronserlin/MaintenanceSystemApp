// src/components/Tool/ToolsList/ToolsList.jsx
import React from 'react';
import {
    Typography,
    Box,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    CardActions,
    Button,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BookIcon from '@mui/icons-material/Book';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';

/**
 * Displays a list of equipment in either responsive Card Grid or Table layout.
 */
export default function ToolsList({ tools = [], viewMode = 'grid', openFaultsByTool = {} }) {
    const navigate = useNavigate();

    if (tools.length === 0) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 5,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                }}
            >
                <PrecisionManufacturingIcon sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5 }} />
                <Typography variant="h6" fontWeight={600}>
                    No equipment found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Try adjusting your search query or filters.
                </Typography>
            </Paper>
        );
    }

    if (viewMode === 'table') {
        return (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID / Unit</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Serial Number</TableCell>
                            <TableCell>Engine Hours</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tools.map((tool) => {
                            const openFaultCount = openFaultsByTool[tool._id] || 0;
                            const hasOpenFaults = openFaultCount > 0;

                            return (
                                <TableRow
                                    key={tool._id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/equipment/${tool._id}`)}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {tool.localSerialNumber || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {tool.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{tool.model || '—'}</TableCell>
                                    <TableCell>{tool.serialNumber || '—'}</TableCell>
                                    <TableCell>
                                        {tool.currentEngineHours !== undefined ? (
                                            <Chip
                                                icon={<SpeedIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                label={`${tool.currentEngineHours} hrs`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={hasOpenFaults ? <WarningAmberIcon /> : <CheckCircleIcon />}
                                            label={hasOpenFaults ? `${openFaultCount} Fault${openFaultCount > 1 ? 's' : ''}` : 'Operational'}
                                            size="small"
                                            color={hasOpenFaults ? 'error' : 'success'}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            endIcon={<ChevronRightIcon />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/equipment/${tool._id}`);
                                            }}
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    // Default: Card Grid View
    return (
        <Grid container spacing={2.5}>
            {tools.map((tool) => {
                const openFaultCount = openFaultsByTool[tool._id] || 0;
                const hasOpenFaults = openFaultCount > 0;
                const schedulesCount = tool.maintenanceSchedule?.length || 0;
                const booksCount = tool.books?.length || 0;

                return (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={tool._id}>
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => theme.palette.mode === 'dark'
                                        ? '0 6px 16px rgba(0,0,0,0.5)'
                                        : '0 6px 16px rgba(0,0,0,0.08)',
                                },
                            }}
                        >
                            <CardActionArea
                                onClick={() => navigate(`/equipment/${tool._id}`)}
                                sx={{ flexGrow: 1, p: 0.5 }}
                            >
                                <CardContent sx={{ pb: 1 }}>
                                    {/* Header with Unit Badge & Status */}
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1.5}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                }}
                                            >
                                                <PrecisionManufacturingIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                                                    {tool.name}
                                                </Typography>
                                                {tool.localSerialNumber && (
                                                    <Typography variant="caption" color="secondary.main" fontWeight={700}>
                                                        UNIT: {tool.localSerialNumber}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Chip
                                            icon={hasOpenFaults ? <WarningAmberIcon /> : <CheckCircleIcon />}
                                            label={hasOpenFaults ? `${openFaultCount} Fault${openFaultCount > 1 ? 's' : ''}` : 'Ready'}
                                            size="small"
                                            color={hasOpenFaults ? 'error' : 'success'}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>

                                    {/* Specs & Info */}
                                    <Box display="flex" flexWrap="wrap" gap={1} mb={1.5}>
                                        {tool.model && (
                                            <Chip
                                                label={`Model: ${tool.model}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        )}
                                        {tool.serialNumber && (
                                            <Chip
                                                label={`S/N: ${tool.serialNumber}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        )}
                                        {tool.currentEngineHours !== undefined && (
                                            <Chip
                                                icon={<SpeedIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                label={`${tool.currentEngineHours} hrs`}
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                                            />
                                        )}
                                    </Box>

                                    {tool.description && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: 40,
                                            }}
                                        >
                                            {tool.description}
                                        </Typography>
                                    )}
                                </CardContent>
                            </CardActionArea>

                            {/* Card Footer with Quick Indicators & Action */}
                            <CardActions
                                sx={{
                                    justifyContent: 'space-between',
                                    px: 2,
                                    py: 1.5,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.subtle',
                                }}
                            >
                                <Box display="flex" gap={1.5} alignItems="center">
                                    <Box display="flex" alignItems="center" gap={0.5} title={`${schedulesCount} Maintenance Schedules`}>
                                        <BuildIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {schedulesCount}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={0.5} title={`${booksCount} Manuals`}>
                                        <BookIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {booksCount}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button
                                    size="small"
                                    variant="text"
                                    endIcon={<ChevronRightIcon />}
                                    onClick={() => navigate(`/equipment/${tool._id}`)}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Manage
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}