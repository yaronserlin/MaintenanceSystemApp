
// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

export default function AccountPage() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({ name: '', email: '' });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name, email: user.email });
    }, [user]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePwdChange = e => setPwd(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const updateProfile = async () => {
        setLoading(true); setMsg(null); setError(null);
        try {
            const { data } = await apiClient.put('/auth/me', form);
            setUser(data);
            setMsg('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        if (pwd.newPassword !== pwd.confirm) {
            setError('New passwords do not match');
            return;
        }
        setLoading(true); setMsg(null); setError(null);
        try {
            const { data } = await apiClient.post('/auth/me/change-password', {
                currentPassword: pwd.currentPassword,
                newPassword: pwd.newPassword
            });
            setMsg(data.message);
            setPwd({ currentPassword: '', newPassword: '', confirm: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Password change failed');
            setPwd({ currentPassword: '', newPassword: '', confirm: '' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Account Settings</Typography>

            {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" sx={{ mb: 4 }}>
                <Typography variant="h6">Profile</Typography>
                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" onClick={updateProfile} disabled={loading}>Save</Button>
            </Box>

            <Box component="form">
                <Typography variant="h6" sx={{ mb: 1 }}>Change Password</Typography>
                <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={pwd.currentPassword}
                    onChange={handlePwdChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={pwd.newPassword}
                    onChange={handlePwdChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirm"
                    type="password"
                    value={pwd.confirm}
                    onChange={handlePwdChange}
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" onClick={changePassword} disabled={loading}>Change Password</Button>
            </Box>
        </Container>
    )
}

