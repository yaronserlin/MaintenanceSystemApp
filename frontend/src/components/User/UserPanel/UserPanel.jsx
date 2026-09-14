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
    TableContainer,
    IconButton,
    FormControl,
    Select,
    MenuItem,
    Box,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

import { CreateUserForm } from '../UserForms/UserForms';
import LoadingComponent from '../../LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent/ErrorComponent';
import DialogComponent from '../../DialogComponent';

/**
 * Presentational user‐management panel.
 * Expects all data+handlers as props (no internal fetch).
 */
export default function UserPanel({
    users,
    loading,
    error,
    onCreate,
    onDelete,
    onRoleChange,
}) {
    const [dialog, setDialog] = useState({ type: null, user: null });
    const [pendingRoles, setPendingRoles] = useState({});
    const [savingUserId, setSavingUserId] = useState(null);

    const openDialog = useCallback((type, user = null) => {
        setDialog({ type, user });
    }, []);
    const closeDialog = useCallback(() => setDialog({ type: null, user: null }), []);

    const handleDelete = useCallback(async () => {
        await onDelete(dialog.user._id);
        closeDialog();
    }, [dialog.user, onDelete, closeDialog]);

    const handleCreate = useCallback(
        async (data) => {
            await onCreate(data);
            closeDialog();
        },
        [onCreate, closeDialog]
    );

    const handleRoleSelect = (userId, newRole) => {
        setPendingRoles(prev => ({ ...prev, [userId]: newRole }));
    };

    const handleSaveRole = async (userId) => {
        const newRole = pendingRoles[userId];
        if (!newRole) return;
        setSavingUserId(userId);
        try {
            await onRoleChange(userId, newRole);
            setPendingRoles(prev => {
                const copy = { ...prev };
                delete copy[userId];
                return copy;
            });
        } finally {
            setSavingUserId(null);
        }
    };

    if (loading) return <LoadingComponent />;
    if (error) return <ErrorComponent message={error} />;

    return (
        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Users
                </Typography>

                <Button variant="contained" sx={{ mb: 1 }} onClick={() => openDialog('create')}>
                    Create
                </Button>

                <TableContainer sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <Table size="small" sx={{ minWidth: 420 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => {
                                const selectedRole = pendingRoles[u._id] || u.role;
                                const hasUnsavedRole = pendingRoles[u._id] && pendingRoles[u._id] !== u.role;
                                const isSaving = savingUserId === u._id;

                                return (
                                    <TableRow key={u._id}>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <FormControl variant="standard" size="small">
                                                    <Select
                                                        value={selectedRole}
                                                        onChange={(e) => handleRoleSelect(u._id, e.target.value)}
                                                    >
                                                        <MenuItem value="operator">Operator</MenuItem>
                                                        <MenuItem value="mechanic">Mechanic</MenuItem>
                                                        <MenuItem value="admin">Admin</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                {isSaving ? (
                                                    <CircularProgress size={20} />
                                                ) : hasUnsavedRole ? (
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        title="Save Role"
                                                        onClick={() => handleSaveRole(u._id)}
                                                    >
                                                        <SaveIcon fontSize="small" />
                                                    </IconButton>
                                                ) : null}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => openDialog('delete', u)} title="Delete User">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create User Dialog */}
            <DialogComponent
                open={dialog.type === 'create'}
                onClose={closeDialog}
                title="Create New User"
                submitButtonText="Create"
                cancelButtonText="Cancel"
            >
                <CreateUserForm onSubmit={handleCreate} />
            </DialogComponent>

            {/* Delete Confirmation */}
            <DialogComponent
                open={dialog.type === 'delete'}
                onClose={closeDialog}
                title="Confirm Delete"
                submitButtonText="Delete"
                cancelButtonText="Cancel"
                onSubmit={handleDelete}
            >
                Are you sure you want to delete “{dialog.user?.name}”?
            </DialogComponent>
        </Grid>
    );
}
