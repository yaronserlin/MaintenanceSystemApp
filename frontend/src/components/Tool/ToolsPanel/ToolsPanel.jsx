import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Grid, Paper, Button,
    Table, TableHead, TableRow, TableCell, TableBody,
    IconButton,
    TableContainer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import adminService from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { CreateToolForm, UpdateToolForm } from '../ToolForms/ToolForms';
import LoadingComponent from '../../LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent/ErrorComponent';

export default function ToolsPanel() {
    const [users, setUsers] = useState([]);
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [toolToDelete, setToolToDelete] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const [usersData, toolsData] = await Promise.all([
                    adminService.getUsers(),
                    adminService.getTools(),
                ]);
                setUsers(usersData);
                setTools(sortBySerial(toolsData));
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();

    }, []);



    const sortBySerial = (arr) =>
        [...arr].sort((a, b) =>
            // If a or b is undefined, treat it as less than the other
            (a.localSerialNumber || '').localeCompare(b.localSerialNumber || '') ||
            // If localSerialNumber is the same, sort by name
            a.name.localeCompare(b.name)
        );


    // Create a new tool
    const handleCreate = async (toolData) => {
        try {
            const newTool = await adminService.createTool(toolData);
            setTools((prev) => sortBySerial([...prev, newTool]));
            setOpenCreate(false);
        } catch (err) {
            console.error(err);
            setError('Failed to create tool');
        }
    };


    // Update an existing tool
    const handleUpdate = async (toolData) => {
        if (!selectedTool) return;
        try {
            const updated = await adminService.updateTool(selectedTool._id, toolData);
            setTools((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setOpenUpdate(false);
            setSelectedTool(null);
        } catch (err) {
            console.error(err);
            setError('Failed to update tool');
        }
    };

    // Handlers for opening/closing create and update dialogs
    const handleOpenCreate = () => {
        setSelectedTool(null);
        setOpenCreate(true);
    };
    const handleCloseCreate = () => setOpenCreate(false);

    const handleOpenUpdate = (event, tool) => {
        console.log('Opening update for tool:', tool);

        setSelectedTool(tool);
        setOpenUpdate(true);
    };
    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setSelectedTool(null);
    };

    // Handlers for delete confirmation dialog
    const handleOpenDelete = (event, tool) => {
        setToolToDelete(tool);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setToolToDelete(null);
    };
    const handleDelete = async () => {
        if (!toolToDelete) return;
        try {
            await adminService.deleteTool(toolToDelete._id);
            setTools((prev) => prev.filter((t) => t._id !== toolToDelete._id));
            handleCloseDelete();
        } catch (err) {
            console.error(err);
            setError('Failed to delete tool');
        }
    };

    if (loading) {
        return <LoadingComponent />;
    }

    if (error) {
        return (
            <ErrorComponent message={error} onRetry={() => window.location.reload()} />
        );
    }


    return (

        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Tools</Typography>
                <Button variant="contained" sx={{ mb: 1 }} onClick={handleOpenCreate}>
                    + New Tool
                </Button>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Serial #</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tools.map(t => (
                                <TableRow key={t._id}>
                                    <TableCell>{t.name}</TableCell>
                                    <TableCell>{t.localSerialNumber}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(event) => handleOpenUpdate(event, t)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={(event) => handleOpenDelete(event, t)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            {/* Create Tool Modal */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
                <DialogTitle>Create New Tool</DialogTitle>
                <DialogContent dividers>
                    <CreateToolForm onSubmit={handleCreate} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreate}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Update Tool Modal */}
            <Dialog open={openUpdate} onClose={handleCloseUpdate} fullWidth maxWidth="sm">
                <DialogTitle>Update Tool</DialogTitle>
                <DialogContent dividers>

                    {selectedTool && <UpdateToolForm initialData={selectedTool} onSubmit={handleUpdate} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdate}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDelete} onClose={handleCloseDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{toolToDelete?.name}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>



    );
}