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
                Create
            </Button>
            <TableContainer sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table size="small" sx={{ minWidth: 320 }}>
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
                                <TableCell>{t.localSerialNumber || t.serialNumber || '-'}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => openDialog('update', t)} title="Edit">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => openDialog('delete', t)} color="error" title="Delete">
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
                    Equipment
                </Typography>
                {body}
            </Paper>

            {/* Create / Update */}
            <DialogComponent
                open={dialog.type === 'create' || dialog.type === 'update'}
                onClose={closeDialog}
                title={dialog.type === 'update' ? 'Update Equipment' : 'Create Equipment'}
                submitButtonText={dialog.type === 'update' ? 'Update' : 'Create'}
                cancelButtonText="Cancel"
                onDelete={dialog.type === 'update' ? () => openDialog('delete', dialog.tool) : undefined}
                deleteButtonText="Delete"
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
                Are you sure you want to delete “{dialog.tool?.name}”? This will also delete all associated faults and maintenance records.
            </DialogComponent>
        </Grid>
    );
}
