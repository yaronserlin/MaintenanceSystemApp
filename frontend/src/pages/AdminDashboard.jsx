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
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';

import adminService from '../services/adminService'; // wrapper for /api/admin
import { useNavigate } from 'react-router-dom';
import ToolsPanel from '../components/Tool/ToolsPanel/ToolsPanel';
import { CreateUserForm } from '../components/User/UserForms/UserForms';
import UserPanel from '../components/User/UserPanel/UserPanel';

export default function AdminDashboard() {
    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
            <Grid container spacing={4}>
                <UserPanel />
                <ToolsPanel />
            </Grid>
        </Container>
    );
}