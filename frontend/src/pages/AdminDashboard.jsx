import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Grid } from '@mui/material';

import adminService from '../services/adminService';
import UserPanel from '../components/User/UserPanel/UserPanel';
import ToolsPanel from '../components/Tool/ToolsPanel/ToolsPanel';
import { useTool } from '../contexts/ToolContext';

/**
 * Page-level component that fetches both users and tools,
 * then delegates display + CRUD handlers to each panel.
 */
export default function AdminDashboard() {
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
        (async () => {
            try {
                const data = await adminService.getUsers();
                setUsers(data);
            } catch (err) {
                console.error(err);
                setErrorUsers('Failed to load users');
            } finally {
                setLoadingUsers(false);
            }
        })();
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
            const newUser = await adminService.createUser(userData);
            setUsers((prev) => [...prev, newUser]);
        },
        []
    );
    const handleDeleteUser = useCallback(
        async (id) => {
            await adminService.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u._id !== id));
        },
        []
    );
    const handleChangeUserRole = useCallback(
        async (id, role) => {
            const updated = await adminService.updateUserRole(id, role);
            setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
        },
        []
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