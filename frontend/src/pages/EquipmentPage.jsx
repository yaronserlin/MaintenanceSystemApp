// src/pages/EquipmentPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Button, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FaultList from '../components/Fault/FaultList/FaultList';
import FaultDetailsDialog from '../components/Fault/FaultDetailsDialog/FaultDetailsDialog';
import CreateFaultDialog from '../components/Fault/CreateFaultDialog/CreateFaultDialog';
import CloseFaultDialog from '../components/Fault/CloseFaultDialog/CloseFaultDialog';
import EquipmentMaintenanceTab from '../components/Tool/EquipmentMaintenanceTab/EquipmentMaintenanceTab';
import EquipmentBooksTab from '../components/Tool/EquipmentBooksTab/EquipmentBooksTab';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import { useEquipment } from '../contexts/EquipmentContext';
import { useFault } from '../contexts/FaultContext';
import { useAuth } from '../contexts/AuthContext';

function a11yProps(index) {
    return {
        id: `equipment-tab-${index}`,
        'aria-controls': `equipment-tabpanel-${index}`,
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`equipment-tabpanel-${index}`}
            aria-labelledby={`equipment-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function EquipmentPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { equipment, loading, error: equipmentError, fetchEquipment } = useEquipment();
    const { faults, error: faultError, createFault, deleteFault, closeFault, reopenFault } = useFault(id);

    const [selectedFault, setSelectedFault] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [faultToClose, setFaultToClose] = useState(null);
    const [faultToDelete, setFaultToDelete] = useState(null);

    // Tab state: 0 = Faults, 1 = Maintenance Schedule, 2 = Books & Manuals
    const [value, setValue] = useState(0);

    const tool = equipment.find((t) => t._id === id);

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
        setCloseDialogOpen(false);
        setSelectedFault(null);
        setFaultToClose(null);
    };

    const handleDeletePrompt = (fault) => {
        setFaultToDelete(fault);
    };

    const handleConfirmDeleteFault = async () => {
        if (!faultToDelete) return;
        await deleteFault(faultToDelete._id);
        setFaultToDelete(null);
        setDetailDialogOpen(false);
    };

    const handleOpenCloseDialog = (fault) => {
        setFaultToClose(fault);
        setCloseDialogOpen(true);
    };

    const handleConfirmCloseFault = async (fault, engineHours) => {
        await closeFault(fault._id, { engineHours });
        setCloseDialogOpen(false);
        setFaultToClose(null);
        fetchEquipment();
    };

    const handleReopenFault = async (fault) => {
        await reopenFault(fault._id);
        fetchEquipment();
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
        fetchEquipment();
    };

    if (loading) {
        return <LoadingComponent />;
    }

    if (faultError || equipmentError) {
        return <ErrorComponent message={faultError || equipmentError} />;
    }

    if (!tool) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>No equipment found.</Typography>
            </Container>
        );
    }

    const booksCount = tool.books?.length || 0;
    const maintenanceCount = tool.maintenanceSchedule?.length || 0;

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
                <Box>
                    <Typography variant="h4" gutterBottom>{tool.name}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Serial: {tool.serialNumber || tool.localSerialNumber || 'N/A'} {tool.model ? `| Model: ${tool.model}` : ''}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>{tool.description}</Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="tabs for equipment details" variant="fullWidth">
                        <Tab label={`Faults (${faults?.length || 0})`} {...a11yProps(0)} />
                        <Tab label={`Maintenance (${maintenanceCount})`} {...a11yProps(1)} />
                        <Tab label={`Books & Manuals (${booksCount})`} {...a11yProps(2)} />
                    </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
                        <Typography variant="h6">Reported Faults</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create
                        </Button>
                    </Box>
                    <FaultList
                        faults={faults}
                        onFaultClick={handleFaultClick}
                        onCloseFault={handleOpenCloseDialog}
                        onReopenFault={handleReopenFault}
                        onDeleteFault={handleDeletePrompt}
                    />
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <EquipmentMaintenanceTab equipment={tool} tool={tool} onRefresh={fetchEquipment} />
                </TabPanel>

                <TabPanel value={value} index={2}>
                    <EquipmentBooksTab equipment={tool} tool={tool} onRefresh={fetchEquipment} />
                </TabPanel>
            </Box>

            <FaultDetailsDialog
                open={detailDialogOpen}
                onClose={handleCloseAll}
                fault={selectedFault}
                onDeleteFault={handleDeletePrompt}
                onCloseFault={handleOpenCloseDialog}
                onReopenFault={handleReopenFault}
            />

            <CreateFaultDialog
                open={createDialogOpen}
                onClose={handleCloseAll}
                onSubmit={handleCreateSubmit}
                equipmentId={tool._id}
                toolId={tool._id}
            />

            <CloseFaultDialog
                open={closeDialogOpen}
                onClose={() => setCloseDialogOpen(false)}
                onConfirm={handleConfirmCloseFault}
                fault={faultToClose}
                equipment={tool}
                tool={tool}
            />

            {/* In-app delete confirmation dialog */}
            <ConfirmDialog
                open={Boolean(faultToDelete)}
                title="Confirm Delete"
                message="Are you sure you want to permanently delete this fault?"
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="error"
                onConfirm={handleConfirmDeleteFault}
                onCancel={() => setFaultToDelete(null)}
            />
        </Container>
    );
}
