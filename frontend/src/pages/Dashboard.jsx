// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Box,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Paper,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

import { useAuth } from '../contexts/AuthContext';
import { useNotify } from '../contexts/NotificationContext';
import apiClient from '../services/apiClient';
import equipmentService from '../services/equipmentService';
import faultService from '../services/faultsService';
import FaultModal from '../components/Fault/FaultModal/FaultModal';
import FaultCard from '../components/Fault/FaultCard/FaultCard';
import CloseFaultDialog from '../components/Fault/CloseFaultDialog/CloseFaultDialog';
import CreateFaultDialog from '../components/Fault/CreateFaultDialog/CreateFaultDialog';

export default function Dashboard() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();
    const { user } = useAuth();
    const notify = useNotify();

    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, fleetTotal: 0, fleetOperational: 0 });
    const [allFaultsList, setAllFaultsList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters for recent faults
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'closed'
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [selectedFault, setSelectedFault] = useState(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [faultToClose, setFaultToClose] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [faultsRes, equipmentRes] = await Promise.all([
                apiClient.get('/faults'),
                equipmentService.getAll().catch(() => []),
            ]);

            const faultsData = Array.isArray(faultsRes.data) ? faultsRes.data : (faultsRes.data.faults || []);
            const equipmentData = Array.isArray(equipmentRes) ? equipmentRes : [];

            const total = faultsData.length;
            const open = faultsData.filter(f => f.status === 'open').length;
            const closed = faultsData.filter(f => f.status === 'closed').length;

            const equipmentWithFaults = new Set(
                faultsData
                    .filter(f => f.status === 'open')
                    .map(f => f.tool?._id || f.tool)
                    .filter(Boolean)
            );
            const fleetTotal = equipmentData.length;
            const fleetOperational = Math.max(0, fleetTotal - equipmentWithFaults.size);

            setStats({ total, open, closed, fleetTotal, fleetOperational });
            setAllFaultsList(faultsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            notify.error('Failed to refresh dashboard data');
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Compute 14-day fault activity trend data for recharts
    const chartData = useMemo(() => {
        const days = 14;
        const result = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

            const reportedCount = allFaultsList.filter(f => {
                if (!f.createdAt) return false;
                return f.createdAt.slice(0, 10) === dateStr;
            }).length;

            const closedCount = allFaultsList.filter(f => {
                if (f.status !== 'closed' || !f.closedAt) return false;
                return f.closedAt.slice(0, 10) === dateStr;
            }).length;

            result.push({
                date: label,
                Reported: reportedCount,
                Resolved: closedCount,
            });
        }
        return result;
    }, [allFaultsList]);

    const isOperator = user?.role === 'operator';

    // Faults reported specifically by the logged-in user (for operator view)
    const operatorFaults = useMemo(() => {
        const effectiveUserId = user?.id || user?._id;
        return allFaultsList.filter(f => {
            const opId = f.operator && (f.operator._id || f.operator);
            return opId === effectiveUserId;
        });
    }, [allFaultsList, user]);

    // Active dataset based on role
    const activeFaultsList = isOperator ? operatorFaults : allFaultsList;

    // Filtered faults list
    const filteredFaults = useMemo(() => {
        const sorted = [...activeFaultsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sorted.filter(fault => {
            if (statusFilter !== 'all' && fault.status !== statusFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const code = (fault.code || '').toLowerCase();
                const desc = (fault.description || '').toLowerCase();
                const eqName = (fault.tool?.name || '').toLowerCase();
                return code.includes(q) || desc.includes(q) || eqName.includes(q);
            }
            return true;
        });
    }, [activeFaultsList, statusFilter, searchQuery]);

    const operatorOpenCount = useMemo(() => operatorFaults.filter(f => f.status === 'open').length, [operatorFaults]);
    const operatorClosedCount = useMemo(() => operatorFaults.filter(f => f.status === 'closed').length, [operatorFaults]);

    const handleCreateFault = async (values) => {
        try {
            await faultService.create({
                ...values,
                operator: user?.id || user?._id,
            });
            notify.success('Fault reported successfully');
            setCreateDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error creating fault:', err);
            notify.error(err.response?.data?.message || 'Failed to report fault');
        }
    };

    const handleConfirmCloseFault = async (fault, engineHours) => {
        try {
            await apiClient.patch(`/faults/${fault._id}/close`, { engineHours });
            setCloseDialogOpen(false);
            setFaultToClose(null);
            notify.success('Fault marked as resolved');
            fetchData();
        } catch (err) {
            console.error('Error closing fault:', err);
            notify.error('Failed to close fault');
        }
    };

    const handleReopenFault = async (fault) => {
        try {
            await apiClient.patch(`/faults/${fault._id}/reopen`);
            notify.success('Fault reopened');
            fetchData();
        } catch (err) {
            console.error('Error reopening fault:', err);
            notify.error('Failed to reopen fault');
        }
    };

    const handleDeleteFault = async (fault) => {
        try {
            await apiClient.delete(`/faults/${fault._id}`);
            notify.success('Fault deleted');
            fetchData();
        } catch (err) {
            console.error('Error deleting fault:', err);
            notify.error('Failed to delete fault');
        }
    };

    if (loading) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress size={40} />
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Loading...
                </Typography>
            </Container>
        );
    }

    const operationalRate = stats.fleetTotal > 0
        ? Math.round((stats.fleetOperational / stats.fleetTotal) * 100)
        : 100;

    // --- OPERATOR VIEW ---
    if (isOperator) {
        return (
            <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
                {/* Header with primary action */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2.5, sm: 3 },
                        mb: 3.5,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Welcome, {user?.name || 'Operator'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Report machine issues and track the status of your reported tickets.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ px: 3, py: 1.25, fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
                    >
                        Report a Fault
                    </Button>
                </Paper>

                {/* Operator Stats Overview */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card>
                            <CardContent sx={{ p: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                    MY REPORTED FAULTS
                                </Typography>
                                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                                    {operatorFaults.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card>
                            <CardContent sx={{ p: 2 }}>
                                <Typography variant="caption" color="error.main" fontWeight={600} display="block">
                                    OPEN / IN PROGRESS
                                </Typography>
                                <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                                    {operatorOpenCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card>
                            <CardContent sx={{ p: 2 }}>
                                <Typography variant="caption" color="success.main" fontWeight={600} display="block">
                                    RESOLVED
                                </Typography>
                                <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                                    {operatorClosedCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Faults list filter bar */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    <Typography variant="h6" fontWeight={700}>
                        My Reported Faults
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center" flexWrap="wrap" width={{ xs: '100%', sm: 'auto' }}>
                        <Box display="flex" gap={0.5}>
                            <Chip
                                label={`All (${operatorFaults.length})`}
                                size="small"
                                variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                                onClick={() => setStatusFilter('all')}
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip
                                label={`Open (${operatorOpenCount})`}
                                size="small"
                                variant={statusFilter === 'open' ? 'filled' : 'outlined'}
                                onClick={() => setStatusFilter('open')}
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip
                                label={`Closed (${operatorClosedCount})`}
                                size="small"
                                variant={statusFilter === 'closed' ? 'filled' : 'outlined'}
                                onClick={() => setStatusFilter('closed')}
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>

                        <TextField
                            size="small"
                            placeholder="Search my faults..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: { xs: '100%', sm: 180 } }}
                        />
                    </Box>
                </Box>

                {/* Operator Faults List */}
                {filteredFaults.length === 0 ? (
                    <Paper
                        variant="outlined"
                        sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2, mb: 4 }}
                    >
                        <CheckCircleIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                            {searchQuery || statusFilter !== 'all' ? 'No matching faults found' : 'You haven\'t reported any faults'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                            {searchQuery ? 'Try clearing your search query.' : 'When equipment needs attention, click "Report a Fault" above.'}
                        </Typography>
                        {searchQuery && (
                            <Button size="small" variant="outlined" onClick={() => setSearchQuery('')}>
                                Clear Search
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {filteredFaults.map(fault => (
                            <Grid size={{ xs: 12, sm: 6 }} key={fault._id}>
                                <FaultCard
                                    fault={fault}
                                    onClick={(f) => setSelectedFault(f)}
                                    onCloseFault={null}
                                    onReopenFault={null}
                                    onDeleteFault={null}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Operator Account Settings Section */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Account & Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Update your name, email, profile photo, or password anytime.
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/account')}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        Change Details & Password
                    </Button>
                </Paper>

                {/* Dialogs */}
                {selectedFault && (
                    <FaultModal
                        fault={selectedFault}
                        handleClose={() => setSelectedFault(null)}
                        open={Boolean(selectedFault)}
                        onCloseFault={null}
                        onReopenFault={null}
                        onDeleteFault={null}
                    />
                )}

                <CreateFaultDialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    onSubmit={handleCreateFault}
                />
            </Container>
        );
    }

    // --- TECHNICIAN / ADMIN VIEW ---
    return (
        <Container sx={{ mt: 3, mb: 6 }}>
            {/* Top Action & Welcome Banner */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 3.5,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Welcome back, {user?.name || 'Technician'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Operations & Equipment Maintenance Center
                    </Typography>
                </Box>

                <Box display="flex" gap={1.5} flexWrap="wrap">
                    <Button
                        variant="outlined"
                        startIcon={<PrecisionManufacturingIcon />}
                        onClick={() => navigate('/equipment')}
                    >
                        Browse Equipment
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ fontWeight: 600 }}
                    >
                        Report Fault
                    </Button>
                </Box>
            </Box>

            {/* KPI Metric Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                TOTAL REPORTED
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                All logged maintenance incidents
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="error.main" fontWeight={600} display="block">
                                ACTIVE FAULTS
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                                {stats.open}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Requiring mechanic attention
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="success.main" fontWeight={600} display="block">
                                RESOLVED FAULTS
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                                {stats.closed}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Closed with engine hours logged
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                FLEET AVAILABILITY
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                                {operationalRate}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {stats.fleetOperational} of {stats.fleetTotal} machines operational
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 14-Day Activity Trend Chart */}
            <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                14-Day Maintenance Trend
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Daily breakdown of new faults vs resolved tickets
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} alignItems="center">
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">Reported</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'text.primary' }} />
                                <Typography variant="caption" color="text.secondary">Resolved</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? '#94a3b8' : '#64748b'} stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor={isDark ? '#94a3b8' : '#64748b'} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? '#f1f5f9' : '#0f172a'} stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor={isDark ? '#f1f5f9' : '#0f172a'} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                                <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                                <YAxis allowDecimals={false} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                    }}
                                />
                                <Area type="monotone" dataKey="Reported" stroke={isDark ? '#94a3b8' : '#64748b'} fillOpacity={1} fill="url(#colorReported)" strokeWidth={1.5} />
                                <Area type="monotone" dataKey="Resolved" stroke={isDark ? '#f1f5f9' : '#0f172a'} fillOpacity={1} fill="url(#colorResolved)" strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Recent Faults Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Recent Fault Reports
                </Typography>

                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap" width={{ xs: '100%', sm: 'auto' }}>
                    <Box display="flex" gap={0.5}>
                        <Chip
                            label={`All (${allFaultsList.length})`}
                            size="small"
                            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                            onClick={() => setStatusFilter('all')}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={`Open (${stats.open})`}
                            size="small"
                            variant={statusFilter === 'open' ? 'filled' : 'outlined'}
                            onClick={() => setStatusFilter('open')}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={`Closed (${stats.closed})`}
                            size="small"
                            variant={statusFilter === 'closed' ? 'filled' : 'outlined'}
                            onClick={() => setStatusFilter('closed')}
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>

                    <TextField
                        size="small"
                        placeholder="Search faults..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: '100%', sm: 180 } }}
                    />
                </Box>
            </Box>

            {filteredFaults.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}
                >
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                        {searchQuery || statusFilter !== 'all' ? 'No matching faults found' : 'No recent faults reported'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {searchQuery ? 'Try clearing your search query or adjusting status filters.' : 'All equipment is currently running with zero reported incidents.'}
                    </Typography>
                    {searchQuery && (
                        <Button size="small" variant="outlined" onClick={() => setSearchQuery('')}>
                            Clear Search
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {filteredFaults.map(fault => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>
                            <FaultCard
                                fault={fault}
                                onClick={(f) => setSelectedFault(f)}
                                onCloseFault={(f) => {
                                    setFaultToClose(f);
                                    setCloseDialogOpen(true);
                                }}
                                onReopenFault={handleReopenFault}
                                onDeleteFault={handleDeleteFault}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* In-App Fault Details Modal */}
            {selectedFault && (
                <FaultModal
                    fault={selectedFault}
                    handleClose={() => setSelectedFault(null)}
                    open={Boolean(selectedFault)}
                    onCloseFault={(f) => {
                        setFaultToClose(f);
                        setCloseDialogOpen(true);
                    }}
                    onReopenFault={handleReopenFault}
                    onDeleteFault={handleDeleteFault}
                />
            )}

            {/* Quick Report Fault Dialog */}
            <CreateFaultDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateFault}
            />

            {/* Close Fault & Engine Hours Dialog */}
            <CloseFaultDialog
                open={closeDialogOpen}
                onClose={() => {
                    setCloseDialogOpen(false);
                    setFaultToClose(null);
                }}
                onConfirm={handleConfirmCloseFault}
                fault={faultToClose}
                equipment={faultToClose?.tool}
                tool={faultToClose?.tool}
            />
        </Container>
    );
}
