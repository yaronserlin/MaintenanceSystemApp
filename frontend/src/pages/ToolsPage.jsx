// src/pages/ToolsPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toolsService from '../services/toolsService';
import ToolsList from '../components/ToolsList/ToolsList';
import { CreateToolForm, UpdateToolForm } from '../components/ToolForms/ToolForms';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';

/**
 * Displays a list of tools and provides modals for create, update, and delete.
 */
export default function ToolsPage() {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [toolToDelete, setToolToDelete] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const navigate = useNavigate();

    const sortBySerial = (arr) =>
        [...arr].sort((a, b) =>
            // If a or b is undefined, treat it as less than the other
            (a.localSerialNumber || '').localeCompare(b.localSerialNumber || '') ||
            // If localSerialNumber is the same, sort by name
            a.name.localeCompare(b.name)


        );

    useEffect(() => {
        toolsService
            .getAll()
            .then((data) => setTools(sortBySerial(data)))
            .catch((err) => {
                console.error(err);
                setError('Failed to load tools');
            })
            .finally(() => setLoading(false));
    }, []);

    // Create a new tool
    const handleCreate = async (toolData) => {
        try {
            const newTool = await toolsService.create(toolData);
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
            const updated = await toolsService.update(selectedTool._id, toolData);
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

    const handleOpenUpdate = (tool) => {
        setSelectedTool(tool);
        setOpenUpdate(true);
    };
    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setSelectedTool(null);
    };

    // Handlers for delete confirmation dialog
    const handleOpenDelete = (tool) => {
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
            await toolsService.delete(toolToDelete._id);
            setTools((prev) => prev.filter((t) => t._id !== toolToDelete._id));
            handleCloseDelete();
        } catch (err) {
            console.error(err);
            setError('Failed to delete tool');
        }
    };

    if (error) {
        return (
            <ErrorComponent message={error} />
        )
    }

    if (loading) {
        return (
            <LoadingComponent />
        )
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Tools
                <Button sx={{ ml: 2 }} variant="contained" onClick={handleOpenCreate}>
                    Create New Tool
                </Button>
            </Typography>

            <ToolsList tools={tools} onSelect={handleOpenUpdate} onDelete={handleOpenDelete} />

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
        </Container>
    );
}