// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Card, CardContent, CircularProgress, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
// import FaultCard from '../components/FaultCard/FaultCard';

import { useNavigate } from 'react-router-dom';
import FaultModal from '../components/Fault/FaultModal/FaultModal';
import FaultList from '../components/Fault/FaultList/FaultList';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
    const [recentFaults, setRecentFaults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFaultModal, setOpenFaultModal] = React.useState(false);
    const handleOpenFaultModal = () => setOpenFaultModal(true);
    const handleCloseFaultModal = () => setOpenFaultModal(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await apiClient.get('/faults');
                const allFaults = Array.isArray(data) ? data : data.faults;
                const total = allFaults.length;
                const open = allFaults.filter(f => f.status === 'open').length;
                const closed = allFaults.filter(f => f.status === 'closed').length;
                setStats({ total, open, closed });
                const sorted = allFaults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentFaults(sorted.slice(0, 5));
            } catch (err) {
                console.error('Error fetching faults:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome, {user?.name || 'User'}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid >
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Faults</Typography>
                            <Typography variant="h3">{stats.total}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid >
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Open Faults</Typography>
                            <Typography variant="h3">{stats.open}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid >
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Closed Faults</Typography>
                            <Typography variant="h3">{stats.closed}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom>Recent Faults</Typography>
            <Grid container spacing={2}>
                <List>
                    {recentFaults.map(fault => (
                        <ListItem
                            disablePadding
                            key={fault._id}
                            onClick={() => {
                                console.log(`Navigating to fault ${fault._id}`)
                                handleOpenFaultModal();
                            }}
                            sx={{ color: fault.status === 'closed' ? 'success.main' : 'error.main' }}
                        >
                            <ListItemButton >
                                <ListItemText >
                                    {fault.tool.name}: {fault.code} {fault.description}

                                </ListItemText>
                                <ListItemText>
                                    <FaultModal
                                        fault={fault}
                                        handleClose={handleCloseFaultModal}
                                        open={openFaultModal}
                                    />
                                </ListItemText>
                            </ListItemButton>
                        </ListItem>
                    ))}

                </List>
            </Grid>

            <FaultList />
        </Container>
    );
};

export default Dashboard;
