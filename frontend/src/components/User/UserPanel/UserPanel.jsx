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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


import adminService from '../../../services/adminService';
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

    if (loading) return <LoadingComponent />;
    if (error) return <ErrorComponent message={error} />;

    return (
        <Grid size={{ xs: 12, lg: 6 }}>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Users
                </Typography>

                <Button variant="contained" sx={{ mb: 1 }} onClick={() => openDialog('create')}>
                    + New User
                </Button>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u._id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <FormControl variant="standard" size="small">
                                            <Select
                                                value={u.role}
                                                onChange={(e) => onRoleChange(u._id, e.target.value)}
                                            >
                                                <MenuItem value="operator">Operator</MenuItem>
                                                <MenuItem value="mechanic">Mechanic</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => openDialog('delete', u)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
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
