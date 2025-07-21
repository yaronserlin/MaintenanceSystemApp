// src/pages/ToolPage.jsx (updated)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress, Alert, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import toolsService from '../services/toolsService';
import faultService from '../services/faultsService';
import FaultList from '../components/Fault/FaultList/FaultList';
import FaultDetailsDialog from '../components/Fault/FaultDetailsDialog/FaultDetailsDialog';
import CreateFaultDialog from '../components/Fault/CreateFaultDialog/CreateFaultDialog';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';

export default function ToolPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedFault, setSelectedFault] = useState(null);

    const fetchTool = () => {
        setLoading(true);
        toolsService
            .getById(id)
            .then((data) => setTool(data))
            .catch((err) => {
                console.error(err);
                setError('Failed to load tool data');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTool();
    }, [id]);

    const handleFaultClick = (fault) => {
        setSelectedFault(fault);
        setDetailDialogOpen(true);
    };

    const handleCloseAll = () => {
        setDetailDialogOpen(false);
        setCreateDialogOpen(false);
        setSelectedFault(null);
    };

    const handleDeleteClick = async (fault) => {
        if (!window.confirm('Are you sure you want to delete this fault?')) return;
        try {
            await faultService.delete(fault._id);
            fetchTool();
        } catch (err) {
            console.error(err);
            alert('Failed to delete fault');
        }
    };

    const handleCloseFault = async (fault) => {
        if (!window.confirm('Mark this fault as closed?')) return;
        try {
            await faultService.close(fault._id);
            fetchTool();
        } catch (err) {
            console.error(err);
            alert('Failed to close fault');
        }
    };

    const handleCreateSubmit = async (values) => {
        console.log('Creating fault with values:', values);

        try {
            await faultService.create({
                ...values,
                operator: user._id,
            });
            handleCloseAll();
            fetchTool();
        } catch (err) {
            console.error(err);
            alert('Failed to create fault');
        }
    };

    const sortedFaults = tool?.faults
        ? [...tool.faults].sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === 'open' ? -1 : 1;
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        })
        : [];

    if (loading) {
        return (
            <LoadingComponent />
        );
    }

    if (error) {
        return (
            <ErrorComponent message={error} />
        );
    }

    if (!tool) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>No tool found.</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{tool.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Serial: {tool.serialNumber || tool.localSerialNumber}
            </Typography>
            <Typography paragraph>{tool.description}</Typography>

            <Box mb={2}>
                <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
                    Create New Fault
                </Button>
            </Box>

            <Typography variant="h5" gutterBottom>Faults</Typography>
            <FaultList
                faults={sortedFaults}
                onFaultClick={handleFaultClick}
                onCloseFault={handleCloseFault}
                onDeleteFault={handleDeleteClick}
            />

            <FaultDetailsDialog open={detailDialogOpen} onClose={handleCloseAll} fault={selectedFault} />
            <CreateFaultDialog open={createDialogOpen} onClose={handleCloseAll} onSubmit={handleCreateSubmit} toolId={tool._id} />
        </Container>
    );
}