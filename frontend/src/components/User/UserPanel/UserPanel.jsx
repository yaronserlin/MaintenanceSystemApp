import React, { useEffect, useState } from 'react';
import {
    Typography, Grid, Paper, Button,
    Table, TableHead, TableRow, TableCell, TableBody,
    IconButton,
    TableContainer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import adminService from '../../../services/adminService';
import { CreateUserForm } from '../UserForms/UserForms';
import LoadingComponent from '../../LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent/ErrorComponent';

export default function UserPanel() {
    const [users, setUsers] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [SelectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const usersData = await adminService.getUsers();

                setUsers(usersData);

            } catch (err) {
                console.error(err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();

    }, []);

    // Create a new user
    const handleCreate = async (userData) => {
        console.log('creating user', userData);
        // Validate userData before proceeding
        if (!userData || !userData.name || !userData.email || !userData.role) {
            setError('Please fill in all required fields');
            return;
        }
        // If no password is provided, set a default one
        if (!userData.password) {
            userData.password = '123456'; // You can change this to a more secure default
        }
        // Ensure userData is not empty
        if (!userData) return;
        try {
            const newUser = await adminService.createUser(userData);
            setUsers((prev) => ([...prev, newUser]));
            setOpenCreate(false);
        } catch (err) {
            console.error(err);
            setError('Failed to create user');
        }
    };


    // Update an existing user
    const handleChangeRole = async (user, newRole) => {
        console.log('Changing role for user', user.name, 'to', newRole);
        try {
            const updated = await adminService.updateUserRole(user._id, newRole);
            setUsers((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        } catch (err) {
            console.error(err);
            setError('Failed to update user role');
        }
    };

    // Handlers for opening/closing create and update dialogs
    const handleOpenCreate = () => {
        setSelectedUser(null);
        setOpenCreate(true);
    };

    const handleCloseCreate = () => setOpenCreate(false);



    // Handlers for delete confirmation dialog
    const handleOpenDelete = (event, user) => {
        setUserToDelete(user);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setUserToDelete(null);
    };
    const handleDelete = async () => {
        console.log('Deleting user', userToDelete._id);
        if (!userToDelete) return;
        try {
            await adminService.deleteUser(userToDelete._id);
            setUsers((prev) => prev.filter((t) => t._id !== userToDelete._id));
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
        return <ErrorComponent message={error} />;
    }

    return (


        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Users</Typography>
                <Button
                    variant="contained"
                    sx={{ mb: 1 }}
                    onClick={handleOpenCreate}
                >
                    + New User
                </Button>

                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell
                                    sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                                >
                                    Email
                                </TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u._id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell
                                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                                    >
                                        {u.email}
                                    </TableCell>
                                    <TableCell>

                                        <FormControl variant="standard" size="small">
                                            <Select
                                                value={u.role}
                                                onChange={e => handleChangeRole(u, e.target.value)}
                                            >
                                                <MenuItem value="operator">Operator</MenuItem>
                                                <MenuItem value="mechanic">Mechanic</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell align="right">

                                        <IconButton onClick={(event) => handleOpenDelete(event, u)}>
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
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent dividers>
                    <CreateUserForm onSubmit={handleCreate} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreate}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDelete} onClose={handleCloseDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{userToDelete?.name}"?
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