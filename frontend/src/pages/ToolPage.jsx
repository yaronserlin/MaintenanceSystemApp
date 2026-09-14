// src/pages/ToolPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Box, Tabs, Tab } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import FaultList from '../components/Fault/FaultList/FaultList';
import FaultDetailsDialog from '../components/Fault/FaultDetailsDialog/FaultDetailsDialog';
import CreateFaultDialog from '../components/Fault/CreateFaultDialog/CreateFaultDialog';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';
import { useTool } from '../contexts/ToolContext';
import { useFault } from '../contexts/FaultContext';
import TabPanel from '../components/TabPanel';

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export default function ToolPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const { tools, loading, error: toolError } = useTool();
    const tool = tools?.find(t => t._id === id);
    const { faults, error: faultError, createFault, deleteFault, closeFault } = useFault(id);

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedFault, setSelectedFault] = useState(null);
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

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
        await deleteFault(fault._id);
    };

    const handleCloseFault = async (fault) => {
        if (!window.confirm('Mark this fault as closed?')) return;
        await closeFault(fault._id);
    };

    const handleCreateSubmit = async (values) => {
        if (!user || !tool) return;
        if (!values.description || !values.code) return;

        const data = {
            ...values,
            tool: tool._id,
            operator: user.id || user._id,
        };

        await createFault(data);
        handleCloseAll();
    };

    if (loading) {
        return <LoadingComponent />;
    }

    if (faultError || toolError) {
        return <ErrorComponent message={faultError || toolError} />;
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
            <Typography variant="subtitle1">{tool.description}</Typography>

            <Box mb={2}>
                <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
                    Create New Fault
                </Button>
            </Box>
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="tabs for tool details" variant="fullWidth">
                        <Tab label="Faults" {...a11yProps(0)} />
                        <Tab label="Maintenance" disabled={true} {...a11yProps(1)} />
                        <Tab label="Books" disabled={true} {...a11yProps(2)} />
                    </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                    <FaultList
                        faults={faults}
                        onFaultClick={handleFaultClick}
                        onCloseFault={handleCloseFault}
                        onDeleteFault={handleDeleteClick}
                    />
                </TabPanel>
            </Box>

            <FaultDetailsDialog open={detailDialogOpen} onClose={handleCloseAll} fault={selectedFault} />
            <CreateFaultDialog open={createDialogOpen} onClose={handleCloseAll} onSubmit={handleCreateSubmit} toolId={tool._id} />
        </Container>
    );
}