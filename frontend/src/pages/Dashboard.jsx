// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Box,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Paper,
    Skeleton,
    useTheme,
    alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as ChartTooltip,
    CartesianGrid,
    Legend,
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

// ─── Skeleton loading state ──────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <Container sx={{ mt: 3, mb: 6 }}>
            <Box mb={3.5}>
                <Skeleton variant="text" width={280} height={44} />
                <Skeleton variant="text" width={200} height={22} />
            </Box>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[0,1,2,3].map(i => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))}
            </Grid>
            <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3, mb: 4 }} />
            <Grid container spacing={2}>
                {[0,1,2].map(i => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, caption, accentColor, icon, iconBg }) {
    return (
        <Card
            sx={{
                borderTop: `4px solid ${accentColor}`,
                borderRadius: '12px',
                '&:hover': { transform: 'translateY(-3px)' },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Typography
                        variant="overline"
                        sx={{ fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em', color: 'text.secondary' }}
                    >
                        {label}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: iconBg,
                            color: accentColor,
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                <Typography
                    variant="h3"
                    fontWeight={800}
                    letterSpacing="-0.025em"
                    sx={{ color: accentColor === '#2563EB' ? 'text.primary' : accentColor, mb: 0.5 }}
                >
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {caption}
                </Typography>
            </CardContent>
        </Card>
    );
}

// ─── Filter bar ──────────────────────────────────────────────────────────────
function FilterBar({ total, openCount, closedCount, statusFilter, setStatusFilter, searchQuery, setSearchQuery, placeholder }) {
    return (
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
            <Box display="flex" gap={0.75} flexWrap="wrap">
                {[
                    { value: 'all',    label: `All (${total})`,         color: 'default' },
                    { value: 'open',   label: `Open (${openCount})`,    color: 'error'   },
                    { value: 'closed', label: `Closed (${closedCount})`,color: 'success' },
                ].map(opt => (
                    <Chip
                        key={opt.value}
                        label={opt.label}
                        size="small"
                        variant={statusFilter === opt.value ? 'filled' : 'outlined'}
                        color={statusFilter === opt.value ? opt.color : 'default'}
                        onClick={() => setStatusFilter(opt.value)}
                        sx={{ fontWeight: 600, cursor: 'pointer' }}
                    />
                ))}
            </Box>

            <TextField
                size="small"
                placeholder={placeholder || 'Search faults...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                }}
                sx={{ width: { xs: '100%', sm: 220 } }}
            />
        </Box>
    );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function FaultEmptyState({ hasFilters, onClear }) {
    return (
        <Paper
            variant="outlined"
            sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}
        >
            <CheckCircleIcon sx={{ fontSize: 52, color: 'success.main', mb: 1.5, opacity: 0.8 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
                {hasFilters ? 'No matching faults found' : 'No faults reported yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: hasFilters ? 2 : 0 }}>
                {hasFilters
                    ? 'Try clearing your filters or search query.'
                    : 'All equipment is currently running with no reported incidents.'
                }
            </Typography>
            {hasFilters && (
                <Button size="small" variant="outlined" onClick={onClear} sx={{ mt: 0.5 }}>
                    Clear filters
                </Button>
            )}
        </Paper>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
    const theme  = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();
    const { user } = useAuth();
    const notify = useNotify();

    const [stats, setStats]           = useState({ total: 0, open: 0, closed: 0, fleetTotal: 0, fleetOperational: 0 });
    const [allFaultsList, setAllFaultsList] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery]   = useState('');
    const [selectedFault, setSelectedFault]   = useState(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [faultToClose, setFaultToClose] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [faultsRes, equipmentRes] = await Promise.all([
                apiClient.get('/faults'),
                equipmentService.getAll().catch(() => []),
            ]);
            const faultsData    = Array.isArray(faultsRes.data) ? faultsRes.data : (faultsRes.data.faults || []);
            const equipmentData = Array.isArray(equipmentRes) ? equipmentRes : [];

            const total  = faultsData.length;
            const open   = faultsData.filter(f => f.status === 'open').length;
            const closed = faultsData.filter(f => f.status === 'closed').length;

            const equipmentWithFaults = new Set(
                faultsData.filter(f => f.status === 'open').map(f => f.tool?._id || f.tool).filter(Boolean)
            );
            const fleetTotal       = equipmentData.length;
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

    useEffect(() => { fetchData(); }, [fetchData]);

    // 14-day chart data
    const chartData = useMemo(() => {
        const days = 14;
        const result = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const label   = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
            result.push({
                date:     label,
                Reported: allFaultsList.filter(f => f.createdAt?.slice(0, 10) === dateStr).length,
                Resolved: allFaultsList.filter(f => f.status === 'closed' && f.closedAt?.slice(0, 10) === dateStr).length,
            });
        }
        return result;
    }, [allFaultsList]);

    const isOperator = user?.role === 'operator';

    const operatorFaults = useMemo(() => {
        const uid = user?.id || user?._id;
        return allFaultsList.filter(f => (f.operator?._id || f.operator) === uid);
    }, [allFaultsList, user]);

    const activeFaultsList = isOperator ? operatorFaults : allFaultsList;

    const filteredFaults = useMemo(() => {
        const sorted = [...activeFaultsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sorted.filter(fault => {
            if (statusFilter !== 'all' && fault.status !== statusFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    (fault.code || '').toLowerCase().includes(q) ||
                    (fault.description || '').toLowerCase().includes(q) ||
                    (fault.tool?.name || '').toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [activeFaultsList, statusFilter, searchQuery]);

    const operatorOpenCount   = useMemo(() => operatorFaults.filter(f => f.status === 'open').length,   [operatorFaults]);
    const operatorClosedCount = useMemo(() => operatorFaults.filter(f => f.status === 'closed').length, [operatorFaults]);

    const handleCreateFault = async (values) => {
        try {
            await faultService.create({ ...values, operator: user?.id || user?._id });
            notify.success('Fault reported successfully');
            setCreateDialogOpen(false);
            fetchData();
        } catch (err) {
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
            notify.error('Failed to close fault');
        }
    };

    const handleReopenFault = async (fault) => {
        try {
            await apiClient.patch(`/faults/${fault._id}/reopen`);
            notify.success('Fault reopened');
            fetchData();
        } catch (err) {
            notify.error('Failed to reopen fault');
        }
    };

    const handleDeleteFault = async (fault) => {
        try {
            await apiClient.delete(`/faults/${fault._id}`);
            notify.success('Fault deleted');
            fetchData();
        } catch (err) {
            notify.error('Failed to delete fault');
        }
    };

    if (loading) return <DashboardSkeleton />;

    const operationalRate = stats.fleetTotal > 0
        ? Math.round((stats.fleetOperational / stats.fleetTotal) * 100)
        : 100;

    const hasFilters = statusFilter !== 'all' || searchQuery.trim();

    // ─── OPERATOR VIEW ───────────────────────────────────────────────────────
    if (isOperator) {
        return (
            <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
                {/* CTA Hero Banner */}
                <Box
                    sx={{
                        p: { xs: 3, sm: 4 },
                        mb: 3.5,
                        borderRadius: 3,
                        background: isDark
                            ? 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)'
                            : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2.5,
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#FFFFFF', lineHeight: 1.2 }}>
                            Welcome, {user?.name || 'Operator'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Report machine issues and track your reported tickets.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            bgcolor: '#FFFFFF',
                            color: '#1D4ED8',
                            fontWeight: 700,
                            px: 3,
                            width: { xs: '100%', sm: 'auto' },
                            flexShrink: 0,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                        }}
                    >
                        Report a Fault
                    </Button>
                </Box>

                {/* Operator Stats */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'MY REPORTS',  value: operatorFaults.length,  accent: '#2563EB', icon: <BugReportIcon sx={{ fontSize: 18 }} />, bg: alpha('#2563EB', 0.1), caption: 'Total faults reported' },
                        { label: 'OPEN',         value: operatorOpenCount,       accent: '#DC2626', icon: <WarningAmberIcon sx={{ fontSize: 18 }} />, bg: alpha('#DC2626', 0.1), caption: 'Pending resolution' },
                        { label: 'RESOLVED',     value: operatorClosedCount,     accent: '#16A34A', icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, bg: alpha('#16A34A', 0.1), caption: 'Successfully closed' },
                    ].map(k => (
                        <Grid size={{ xs: 12, sm: 4 }} key={k.label}>
                            <KpiCard
                                label={k.label}
                                value={k.value}
                                caption={k.caption}
                                accentColor={k.accent}
                                icon={k.icon}
                                iconBg={k.bg}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Faults Section */}
                <Typography variant="h6" fontWeight={700} mb={2}>My Reported Faults</Typography>
                <FilterBar
                    total={operatorFaults.length}
                    openCount={operatorOpenCount}
                    closedCount={operatorClosedCount}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search my faults..."
                />

                {filteredFaults.length === 0 ? (
                    <FaultEmptyState
                        hasFilters={hasFilters}
                        onClear={() => { setStatusFilter('all'); setSearchQuery(''); }}
                    />
                ) : (
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {filteredFaults.map(fault => (
                            <Grid size={{ xs: 12, sm: 6 }} key={fault._id}>
                                <FaultCard fault={fault} onClick={f => setSelectedFault(f)} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Account quick-link */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2.5,
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Account & Details</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Update your name, email, profile photo, or password.
                        </Typography>
                    </Box>
                    <Button variant="outlined" onClick={() => navigate('/account')} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        Change Details & Password
                    </Button>
                </Paper>

                {/* Dialogs */}
                {selectedFault && (
                    <FaultModal fault={selectedFault} handleClose={() => setSelectedFault(null)} open={Boolean(selectedFault)} />
                )}
                <CreateFaultDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSubmit={handleCreateFault} />
            </Container>
        );
    }

    // ─── TECHNICIAN / ADMIN VIEW ─────────────────────────────────────────────
    return (
        <Container sx={{ mt: 3, mb: 6 }}>
            {/* Welcome Header */}
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
                    <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
                        Welcome back, {user?.name || 'Technician'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Operations & Equipment Maintenance Dashboard
                    </Typography>
                </Box>

                <Box display="flex" gap={1.5} flexWrap="wrap">
                    <Button
                        variant="outlined"
                        startIcon={<PrecisionManufacturingIcon />}
                        onClick={() => navigate('/equipment')}
                        sx={{ minHeight: 44 }}
                    >
                        Browse Equipment
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ minHeight: 44, fontWeight: 700 }}
                    >
                        Report Fault
                    </Button>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    {
                        label: 'TOTAL REPORTED',
                        value: stats.total,
                        caption: 'All logged maintenance incidents',
                        accentColor: '#2563EB',
                        icon: <BugReportIcon sx={{ fontSize: 18 }} />,
                        iconBg: alpha('#2563EB', isDark ? 0.2 : 0.1),
                    },
                    {
                        label: 'ACTIVE FAULTS',
                        value: stats.open,
                        caption: 'Requiring mechanic attention',
                        accentColor: '#DC2626',
                        icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
                        iconBg: alpha('#DC2626', isDark ? 0.2 : 0.1),
                    },
                    {
                        label: 'RESOLVED',
                        value: stats.closed,
                        caption: 'Closed with engine hours logged',
                        accentColor: '#16A34A',
                        icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
                        iconBg: alpha('#16A34A', isDark ? 0.2 : 0.1),
                    },
                    {
                        label: 'FLEET AVAILABILITY',
                        value: `${operationalRate}%`,
                        caption: `${stats.fleetOperational} of ${stats.fleetTotal} machines operational`,
                        accentColor: '#0891B2',
                        icon: <SpeedIcon sx={{ fontSize: 18 }} />,
                        iconBg: alpha('#0891B2', isDark ? 0.2 : 0.1),
                    },
                ].map(k => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={k.label}>
                        <KpiCard {...k} />
                    </Grid>
                ))}
            </Grid>

            {/* 14-Day Activity Chart */}
            <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={2.5}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                14-Day Maintenance Trend
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Daily breakdown of reported faults vs resolved tickets
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} alignItems="center">
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#DC2626' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>Reported</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#16A34A' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>Resolved</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', height: { xs: 160, sm: 220 } }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradReported" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}   />
                                    </linearGradient>
                                    <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0}   />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    stroke={isDark ? '#64748B' : '#94A3B8'}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: isDark ? '#64748B' : '#94A3B8' }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    stroke={isDark ? '#64748B' : '#94A3B8'}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: isDark ? '#64748B' : '#94A3B8' }}
                                />
                                <ChartTooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                        borderColor:     isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                        borderRadius:    '10px',
                                        fontSize:        '0.8rem',
                                        fontWeight:      500,
                                        boxShadow:       '0 4px 16px rgba(0,0,0,0.12)',
                                        border:          `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                    }}
                                    cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Reported"
                                    stroke="#DC2626"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gradReported)"
                                    dot={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Resolved"
                                    stroke="#16A34A"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gradResolved)"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Recent Faults Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Recent Fault Reports</Typography>
            </Box>

            <FilterBar
                total={allFaultsList.length}
                openCount={stats.open}
                closedCount={stats.closed}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {filteredFaults.length === 0 ? (
                <FaultEmptyState
                    hasFilters={hasFilters}
                    onClear={() => { setStatusFilter('all'); setSearchQuery(''); }}
                />
            ) : (
                <Grid container spacing={2}>
                    {filteredFaults.map(fault => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>
                            <FaultCard
                                fault={fault}
                                onClick={f => setSelectedFault(f)}
                                onCloseFault={(f) => { setFaultToClose(f); setCloseDialogOpen(true); }}
                                onReopenFault={handleReopenFault}
                                onDeleteFault={handleDeleteFault}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialogs */}
            {selectedFault && (
                <FaultModal
                    fault={selectedFault}
                    handleClose={() => setSelectedFault(null)}
                    open={Boolean(selectedFault)}
                    onCloseFault={(f) => { setFaultToClose(f); setCloseDialogOpen(true); }}
                    onReopenFault={handleReopenFault}
                    onDeleteFault={handleDeleteFault}
                />
            )}
            <CreateFaultDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateFault}
            />
            <CloseFaultDialog
                open={closeDialogOpen}
                onClose={() => { setCloseDialogOpen(false); setFaultToClose(null); }}
                onConfirm={handleConfirmCloseFault}
                fault={faultToClose}
                equipment={faultToClose?.tool}
                tool={faultToClose?.tool}
            />
        </Container>
    );
}
