import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Grid } from '@mui/material';

import adminService from '../services/adminService';
import UserPanel from '../components/User/UserPanel/UserPanel';
import ToolsPanel from '../components/Tool/ToolsPanel/ToolsPanel';
import { useTool } from '../contexts/ToolContext';
import { useNotify } from '../contexts/NotificationContext';

/**
 * Page-level component that fetches both users and tools,
 * then delegates display + CRUD handlers to each panel.
 */
export default function AdminDashboard() {
    const notify = useNotify();

    // tools from context
    const {
        tools,
        loading: toolLoading,
        error: toolError,
        createTool,
        updateTool,
        deleteTool,
    } = useTool();

    // users state
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState(null);

    // fetch users once
    useEffect(() => {
        let isMounted = true;
        adminService
            .getUsers()
            .then((data) => {
                if (isMounted) setUsers(data);
            })
            .catch((err) => {
                if (isMounted) setErrorUsers(err);
            })
            .finally(() => {
                if (isMounted) setLoadingUsers(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // tool handlers (just forward to context)
    const handleCreateTool = useCallback(
        async (toolData) => {
            await createTool(toolData);
        },
        [createTool]
    );
    const handleUpdateTool = useCallback(
        async (id, toolData) => {
            await updateTool(id, toolData);
        },
        [updateTool]
    );
    const handleDeleteTool = useCallback(
        async (id) => {
            await deleteTool(id);
        },
        [deleteTool]
    );

    // user handlers (local)
    const handleCreateUser = useCallback(
        async (userData) => {
            try {
                const newUser = await adminService.createUser(userData);
                setUsers((prev) => [...prev, newUser]);
                notify.success('User created successfully');
            } catch (err) {
                console.error('Create user error:', err);
                notify.error('Failed to create user');
            }
        },
        [notify]
    );
    const handleDeleteUser = useCallback(
        async (id) => {
            try {
                await adminService.deleteUser(id);
                setUsers((prev) => prev.filter((u) => u._id !== id));
                notify.success('User deleted');
            } catch (err) {
                console.error('Delete user error:', err);
                notify.error('Failed to delete user');
            }
        },
        [notify]
    );
    const handleChangeUserRole = useCallback(
        async (id, role) => {
            try {
                const updated = await adminService.updateUserRole(id, role);
                setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
                notify.success(`User role updated to ${role} successfully`);
            } catch (err) {
                console.error('Role update error:', err);
                notify.error('Failed to update user role');
            }
        },
        [notify]
    );

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Grid container spacing={4}>
                <UserPanel
                    users={users}
                    loading={loadingUsers}
                    error={errorUsers}
                    onCreate={handleCreateUser}
                    onDelete={handleDeleteUser}
                    onRoleChange={handleChangeUserRole}
                />

                <ToolsPanel
                    tools={tools}
                    loading={toolLoading}
                    error={toolError}
                    onCreate={handleCreateTool}
                    onUpdate={handleUpdateTool}
                    onDelete={handleDeleteTool}
                />
            </Grid>
        </Container>
    );
}