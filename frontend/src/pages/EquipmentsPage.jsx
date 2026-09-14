// src/pages/EquipmentsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import ToolsList from '../components/Tool/ToolsList/ToolsList';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';
import { CreateToolForm } from '../components/Tool/ToolForms/ToolForms';
import { useEquipment } from '../contexts/EquipmentContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

/**
 * Displays an interactive directory of equipment with search, status filtering, and view mode toggle.
 */
export default function EquipmentsPage() {
    const { equipment, loading, error, createEquipment } = useEquipment();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'faults' | 'operational'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [openFaultsByTool, setOpenFaultsByTool] = useState({});
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Fetch open faults to mark equipment statuses
    useEffect(() => {
        let isMounted = true;
        apiClient.get('/faults')
            .then(res => {
                if (!isMounted) return;
                const list = Array.isArray(res.data) ? res.data : (res.data.faults || []);
                const counts = {};
                list.filter(f => f.status === 'open').forEach(f => {
                    const toolId = f.tool?._id || f.tool;
                    if (toolId) {
                        counts[toolId] = (counts[toolId] || 0) + 1;
                    }
                });
                setOpenFaultsByTool(counts);
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);

    // Filter equipment by search query and status filter
    const filteredEquipment = useMemo(() => {
        return (equipment || []).filter(item => {
            const openFaults = openFaultsByTool[item._id] || 0;
            if (statusFilter === 'faults' && openFaults === 0) return false;
            if (statusFilter === 'operational' && openFaults > 0) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const name = (item.name || '').toLowerCase();
                const model = (item.model || '').toLowerCase();
                const sn = (item.serialNumber || '').toLowerCase();
                const localSn = (item.localSerialNumber || '').toLowerCase();
                return name.includes(q) || model.includes(q) || sn.includes(q) || localSn.includes(q);
            }
            return true;
        });
    }, [equipment, openFaultsByTool, statusFilter, searchQuery]);

    const handleCreateSubmit = async (data) => {
        await createEquipment(data);
        setCreateDialogOpen(false);
    };

    if (error) {
        return <ErrorComponent message={error} />;
    }

    if (loading) {
        return <LoadingComponent />;
    }

    const faultyCount = Object.keys(openFaultsByTool).length;
    const operationalCount = Math.max(0, (equipment?.length || 0) - faultyCount);

    return (
        <Container sx={{ mt: 3, mb: 6 }}>
            {/* Header with Title and Add Action */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={2}
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Equipment Fleet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage machinery, service logs, operating hours, and manuals
                    </Typography>
                </Box>

                {isAdmin && (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ fontWeight: 700 }}
                    >
                        Add Equipment
                    </Button>
                )}
            </Box>

            {/* Filter and View Controls Bar */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
                mb={3}
            >
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                    <TextField
                        size="small"
                        placeholder="Search equipment, serial, model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: '100%', sm: 280 } }}
                    />

                    <Box display="flex" gap={0.5}>
                        <Chip
                            label={`All (${equipment?.length || 0})`}
                            size="small"
                            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                            color="primary"
                            onClick={() => setStatusFilter('all')}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={`Operational (${operationalCount})`}
                            size="small"
                            variant={statusFilter === 'operational' ? 'filled' : 'outlined'}
                            color="success"
                            onClick={() => setStatusFilter('operational')}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={`Needs Attention (${faultyCount})`}
                            size="small"
                            variant={statusFilter === 'faults' ? 'filled' : 'outlined'}
                            color="error"
                            onClick={() => setStatusFilter('faults')}
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>
                </Box>

                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, val) => val && setViewMode(val)}
                    size="small"
                    aria-label="view layout"
                >
                    <ToggleButton value="grid" aria-label="card grid view">
                        <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="table" aria-label="table view">
                        <ViewListIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Equipment Grid or Table */}
            <ToolsList
                tools={filteredEquipment}
                viewMode={viewMode}
                openFaultsByTool={openFaultsByTool}
            />

            {/* Add Equipment Dialog for Admins */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Register New Equipment</Typography>
                    <IconButton size="small" onClick={() => setCreateDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <CreateToolForm onSubmit={handleCreateSubmit} />
                </DialogContent>
            </Dialog>
        </Container>
    );
}
