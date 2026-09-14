// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Avatar,
    Chip,
    Button,
    Paper,
    Grid,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SpeedIcon from '@mui/icons-material/Speed';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import faultService from '../services/faultsService';
import { getMediaUrl } from '../utils/mediaUtils';

export default function ProfilePage() {
    const { user, userId } = useAuth();
    const navigate = useNavigate();
    const [faults, setFaults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const effectiveUserId = userId || user?.id || user?._id;

    useEffect(() => {
        async function loadFaults() {
            try {
                const all = await faultService.getAll();
                const mine = all.filter(f => {
                    const op = f.operator && (f.operator._id || f.operator);
                    return op === effectiveUserId;
                });
                const sorted = mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setFaults(sorted);
            } catch (err) {
                console.error(err);
                setError('Failed to load your reported faults');
            } finally {
                setLoading(false);
            }
        }
        if (effectiveUserId) {
            loadFaults();
        } else {
            setLoading(false);
        }
    }, [effectiveUserId]);

    const filteredFaults = useMemo(() => {
        if (statusFilter === 'all') return faults;
        return faults.filter(f => f.status === statusFilter);
    }, [faults, statusFilter]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const openCount = faults.filter(f => f.status === 'open').length;
    const closedCount = faults.filter(f => f.status === 'closed').length;
    const avatarSrc = getMediaUrl(user?.avatar || user?.avatarUrl);

    return (
        <Container sx={{ mt: 3, mb: 6 }}>
            {/* User Profile Summary Header */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={avatarSrc}
                            alt={user?.name}
                            sx={{ width: 64, height: 64, bgcolor: 'secondary.main', fontSize: '1.5rem', fontWeight: 700 }}
                        >
                            {user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h5" fontWeight={700}>
                                    {user?.name || 'Technician'}
                                </Typography>
                                {user?.role && (
                                    <Chip
                                        label={user.role.toUpperCase()}
                                        color={user.role === 'admin' ? 'error' : 'secondary'}
                                        size="small"
                                        sx={{ fontWeight: 700, height: 22 }}
                                    />
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ManageAccountsIcon />}
                        onClick={() => navigate('/account')}
                    >
                        Edit Account Details
                    </Button>
                </Box>
            </Paper>

            {/* Reported Faults Section Header & Stats */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2.5}>
                <Box display="flex" alignItems="center" gap={1}>
                    <HistoryIcon color="primary" />
                    <Typography variant="h5" fontWeight={700}>
                        My Reported Activity
                    </Typography>
                </Box>

                <Box display="flex" gap={1}>
                    <Chip
                        label={`All (${faults.length})`}
                        size="small"
                        variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                        color="primary"
                        onClick={() => setStatusFilter('all')}
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip
                        label={`Open (${openCount})`}
                        size="small"
                        variant={statusFilter === 'open' ? 'filled' : 'outlined'}
                        color="error"
                        onClick={() => setStatusFilter('open')}
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip
                        label={`Closed (${closedCount})`}
                        size="small"
                        variant={statusFilter === 'closed' ? 'filled' : 'outlined'}
                        color="success"
                        onClick={() => setStatusFilter('closed')}
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Box>

            {filteredFaults.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}
                >
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                        {statusFilter !== 'all' ? 'No matching tickets' : 'No activity logged yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {statusFilter !== 'all'
                            ? 'Try switching to a different status filter.'
                            : 'When you report equipment faults or incidents, they will appear here.'}
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {filteredFaults.map(fault => {
                        const toolId = fault.tool?._id || fault.tool;
                        const toolName = fault.tool?.name;

                        return (
                            <Grid size={{ xs: 12 }} key={fault._id}>
                                <Card
                                    sx={{
                                        transition: 'box-shadow 0.2s',
                                        '&:hover': {
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? '0 4px 12px rgba(0,0,0,0.4)'
                                                : '0 4px 12px rgba(0,0,0,0.06)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
                                            <Box>
                                                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {fault.code || 'Fault'}
                                                    </Typography>
                                                    <Chip
                                                        icon={fault.status === 'open' ? <WarningAmberIcon /> : <CheckCircleIcon />}
                                                        label={fault.status === 'open' ? 'Open' : 'Closed'}
                                                        size="small"
                                                        color={fault.status === 'open' ? 'error' : 'success'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Box>
                                                {toolName && (
                                                    <Typography variant="caption" color="secondary.main" fontWeight={600} display="block">
                                                        Equipment: {toolName}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {toolId && (
                                                <Button
                                                    size="small"
                                                    endIcon={<ChevronRightIcon />}
                                                    onClick={() => navigate(`/equipment/${toolId}`)}
                                                >
                                                    View Equipment
                                                </Button>
                                            )}
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                            {fault.description}
                                        </Typography>

                                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                            {fault.engineHours !== undefined && (
                                                <Chip
                                                    icon={<SpeedIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                    label={`${fault.engineHours} hrs`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                Reported on: {new Date(fault.createdAt).toLocaleDateString('en-GB')}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
}