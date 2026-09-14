import React, { useState, useCallback, useMemo } from 'react';
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
    TextField,
    InputAdornment,
    Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { CreateUserForm } from '../UserForms/UserForms';
import LoadingComponent from '../../LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent/ErrorComponent';
import DialogComponent from '../../DialogComponent';

export default function UserPanel({
    users = [],
    loading,
    error,
    onCreate,
    onDelete,
    onRoleChange,
}) {
    const [dialog, setDialog] = useState({ type: null, user: null });
    const [savingUserId, setSavingUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleRoleSelect = async (userId, newRole) => {
        if (!newRole) return;
        setSavingUserId(userId);
        try {
            await onRoleChange(userId, newRole);
        } finally {
            setSavingUserId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q)
        );
    }, [users, searchQuery]);

    if (loading) return <LoadingComponent />;
    if (error) return <ErrorComponent message={error} />;

    return (
        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1.5,
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            User Management
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {users.length} registered accounts
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => openDialog('create')}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        Create User
                    </Button>
                </Box>

                <TextField
                    size="small"
                    placeholder="Filter by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                {/* Mobile Card View (< sm) */}
                <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                    {filteredUsers.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                            No users found matching "{searchQuery}"
                        </Typography>
                    ) : (
                        filteredUsers.map((u) => {
                            const isSaving = savingUserId === u._id;

                            return (
                                <Paper
                                    key={u._id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.75,
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.25,
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ minWidth: 0, mr: 1 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>
                                                {u.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ wordBreak: 'break-all', display: 'block' }}
                                            >
                                                {u.email}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => openDialog('delete', u)}
                                            title="Delete User"
                                            aria-label={`Delete ${u.name}`}
                                            sx={{ flexShrink: 0 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        pt={1}
                                        borderTop="1px solid"
                                        borderColor="divider"
                                    >
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Role
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FormControl variant="outlined" size="small">
                                                <Select
                                                    value={u.role || 'operator'}
                                                    disabled={isSaving}
                                                    onChange={(e) => handleRoleSelect(u._id, e.target.value)}
                                                    sx={{ fontSize: '0.8rem', height: 30 }}
                                                >
                                                    <MenuItem value="operator">Operator</MenuItem>
                                                    <MenuItem value="mechanic">Mechanic</MenuItem>
                                                    <MenuItem value="admin">Admin</MenuItem>
                                                </Select>
                                            </FormControl>
                                            {isSaving && <CircularProgress size={14} />}
                                        </Box>
                                    </Box>
                                </Paper>
                            );
                        })
                    )}
                </Box>

                {/* Desktop Table View (>= sm) */}
                <TableContainer sx={{ display: { xs: 'none', sm: 'block' }, width: '100%', overflowX: 'auto' }}>
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
                            {filteredUsers.map((u) => {
                                const isSaving = savingUserId === u._id;

                                return (
                                    <TableRow key={u._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {u.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {u.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <FormControl variant="outlined" size="small" sx={{ minWidth: 110 }}>
                                                    <Select
                                                        value={u.role || 'operator'}
                                                        disabled={isSaving}
                                                        onChange={(e) => handleRoleSelect(u._id, e.target.value)}
                                                        sx={{ fontSize: '0.8rem', height: 32 }}
                                                    >
                                                        <MenuItem value="operator">Operator</MenuItem>
                                                        <MenuItem value="mechanic">Mechanic</MenuItem>
                                                        <MenuItem value="admin">Admin</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                {isSaving && <CircularProgress size={16} />}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => openDialog('delete', u)}
                                                title="Delete User"
                                                aria-label={`Delete ${u.name}`}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialogs */}
            <DialogComponent
                open={dialog.type === 'create'}
                onClose={closeDialog}
                title="Create New User"
            >
                <CreateUserForm onSubmit={handleCreate} />
            </DialogComponent>

            <DialogComponent
                open={dialog.type === 'delete'}
                onClose={closeDialog}
                title="Delete User"
            >
                <Typography mb={2}>
                    Are you sure you want to permanently delete{' '}
                    <strong>{dialog.user?.name}</strong> ({dialog.user?.email})?
                </Typography>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Button onClick={closeDialog} variant="outlined">Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </Box>
            </DialogComponent>
        </Grid>
    );
}
