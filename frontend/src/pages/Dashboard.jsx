// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Grid, Typography, Card, CardContent, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import FaultModal from '../components/Fault/FaultModal/FaultModal';
import FaultCard from '../components/Fault/FaultCard/FaultCard';
import CloseFaultDialog from '../components/Fault/CloseFaultDialog/CloseFaultDialog';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
    const [recentFaults, setRecentFaults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFault, setSelectedFault] = useState(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [faultToClose, setFaultToClose] = useState(null);

    const handleOpenFaultModal = (fault) => setSelectedFault(fault);
    const handleCloseFaultModal = () => setSelectedFault(null);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/faults');
            const allFaults = Array.isArray(data) ? data : (data.faults || []);
            const total = allFaults.length;
            const open = allFaults.filter(f => f.status === 'open').length;
            const closed = allFaults.filter(f => f.status === 'closed').length;
            setStats({ total, open, closed });
            const sorted = [...allFaults].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentFaults(sorted.slice(0, 6));
        } catch (err) {
            console.error('Error fetching faults:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleOpenCloseDialog = (fault) => {
        setFaultToClose(fault);
        setCloseDialogOpen(true);
    };

    const handleConfirmCloseFault = async (fault, engineHours) => {
        try {
            await apiClient.patch(`/faults/${fault._id}/close`, { engineHours });
            setCloseDialogOpen(false);
            setFaultToClose(null);
            fetchStats();
        } catch (err) {
            console.error('Error closing fault:', err);
        }
    };

    const handleReopenFault = async (fault) => {
        try {
            await apiClient.put(`/faults/${fault._id}/reopen`);
            fetchStats();
        } catch (err) {
            console.error('Error reopening fault:', err);
        }
    };

    const handleDeleteFault = async (fault) => {
        try {
            await apiClient.delete(`/faults/${fault._id}`);
            setRecentFaults(prev => prev.filter(f => f._id !== fault._id));
            setStats(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
                open: fault.status === 'open' ? Math.max(0, prev.open - 1) : prev.open,
                closed: fault.status === 'closed' ? Math.max(0, prev.closed - 1) : prev.closed,
            }));
        } catch (err) {
            console.error('Error deleting fault:', err);
        }
    };

    if (loading) {
        return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
    }

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                Welcome, {user?.name || 'User'}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Faults</Typography>
                            <Typography variant="h3">{stats.total}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Open Faults</Typography>
                            <Typography variant="h3" color="error.main">{stats.open}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Closed Faults</Typography>
                            <Typography variant="h3" color="success.main">{stats.closed}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Recent Faults
            </Typography>

            {recentFaults.length === 0 ? (
                <Typography color="text.secondary">
                    No recent faults reported.
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {recentFaults.map(fault => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>
                            <FaultCard
                                fault={fault}
                                onClick={handleOpenFaultModal}
                                onCloseFault={handleOpenCloseDialog}
                                onReopenFault={handleReopenFault}
                                onDeleteFault={handleDeleteFault}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {selectedFault && (
                <FaultModal
                    fault={selectedFault}
                    handleClose={handleCloseFaultModal}
                    open={Boolean(selectedFault)}
                    onCloseFault={handleOpenCloseDialog}
                    onReopenFault={handleReopenFault}
                    onDeleteFault={handleDeleteFault}
                />
            )}

            <CloseFaultDialog
                open={closeDialogOpen}
                onClose={() => setCloseDialogOpen(false)}
                onConfirm={handleConfirmCloseFault}
                fault={faultToClose}
                equipment={faultToClose?.tool}
                tool={faultToClose?.tool}
            />
        </Container>
    );
};

export default Dashboard;
