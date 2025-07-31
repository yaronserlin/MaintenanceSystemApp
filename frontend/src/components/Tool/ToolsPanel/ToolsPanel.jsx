import React, { useState, useCallback } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    TableContainer,
    Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { CreateToolForm, UpdateToolForm } from '../ToolForms/ToolForms';
import LoadingComponent from '../../LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent/ErrorComponent';
import DialogComponent from '../../DialogComponent';

/**
 * ToolsPanel: list + CRUD dialogs for tools.
 */
export default function ToolsPanel({ tools, loading, error, onCreate, onUpdate, onDelete }) {
    const [dialog, setDialog] = useState({ type: null, tool: null });

    const openDialog = useCallback((type, tool = null) => setDialog({ type, tool }), []);
    const closeDialog = useCallback(() => setDialog({ type: null, tool: null }), []);

    const handleCreate = useCallback(
        async (data) => {
            await onCreate(data);
            closeDialog();
        },
        [onCreate, closeDialog]
    );

    const handleUpdate = useCallback(
        async (data) => {
            await onUpdate(dialog.tool._id, data);
            closeDialog();
        },
        [onUpdate, dialog.tool, closeDialog]
    );

    const handleDelete = useCallback(
        async () => {
            await onDelete(dialog.tool._id);
            closeDialog();
        },
        [onDelete, dialog.tool, closeDialog]
    );

    const body = loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', height: 200 }}>
            <LoadingComponent />
        </Box>
    ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', height: 200 }}>
            <ErrorComponent message={error} />
        </Box>
    ) : (
        <>
            <Button variant="contained" sx={{ mb: 1 }} onClick={() => openDialog('create')}>
                + New Tool
            </Button>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Serial #</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tools.map((t) => (
                            <TableRow key={t._id}>
                                <TableCell>{t.name}</TableCell>
                                <TableCell>{t.localSerialNumber}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => openDialog('update', t)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => openDialog('delete', t)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );

    return (
        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Tools
                </Typography>
                {body}
            </Paper>

            {/* Create / Update */}
            <DialogComponent
                open={dialog.type === 'create' || dialog.type === 'update'}
                onClose={closeDialog}
                title={dialog.type === 'update' ? 'Update Tool' : 'Create New Tool'}
                submitButtonText={dialog.type === 'update' ? 'Update' : 'Create'}
                cancelButtonText="Cancel"
            // onSubmit={dialog.type === 'update' ? handleUpdate : handleCreate}
            >
                {dialog.type === 'update' ? (
                    <UpdateToolForm initialData={dialog.tool} onSubmit={handleUpdate} />
                ) : (
                    <CreateToolForm onSubmit={handleCreate} />
                )}
            </DialogComponent>

            {/* Delete */}
            <DialogComponent
                open={dialog.type === 'delete'}
                onClose={closeDialog}
                title="Confirm Delete"
                submitButtonText="Delete"
                cancelButtonText="Cancel"
                onSubmit={handleDelete}
            >
                Are you sure you want to delete “{dialog.tool?.name}”?
            </DialogComponent>
        </Grid>
    );
}
