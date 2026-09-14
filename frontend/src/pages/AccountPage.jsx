// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    Avatar,
    IconButton,
    CircularProgress,
    Divider,
    Paper,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { getMediaUrl } from '../utils/mediaUtils';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function AccountPage() {
    const { user, setUser, updateAvatar } = useAuth();
    const [form, setForm] = useState({ name: '', email: '' });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name || '', email: user.email || '' });
    }, [user]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePwdChange = e => setPwd(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarLoading(true);
        setMsg(null);
        setError(null);
        try {
            if (updateAvatar) {
                await updateAvatar(file);
            } else {
                const formData = new FormData();
                formData.append('avatar', file);
                const { data } = await apiClient.post('/auth/me/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setUser(prev => ({ ...prev, ...data }));
            }
            setMsg('Profile picture updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload profile picture');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMsg(null);
        setError(null);
        try {
            const { data } = await apiClient.put('/auth/me', form);
            setUser(prev => ({ ...prev, ...data }));
            setMsg('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();
        if (pwd.newPassword !== pwd.confirm) {
            setError('New passwords do not match');
            return;
        }
        setLoading(true);
        setMsg(null);
        setError(null);
        try {
            const { data } = await apiClient.post('/auth/me/change-password', {
                currentPassword: pwd.currentPassword,
                newPassword: pwd.newPassword,
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
        <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>Account Settings</Typography>

            {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Profile Avatar Card */}
            <Paper
                variant="outlined"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    mb: 4,
                    p: 3,
                    borderRadius: 2,
                }}
            >
                <Box position="relative">
                    <Avatar
                        src={getMediaUrl(user?.avatar)}
                        alt={user?.name}
                        sx={{ width: 84, height: 84, fontSize: '2rem', bgcolor: 'primary.main', color: 'primary.contrastText' }}
                    >
                        {user?.name?.charAt(0)}
                    </Avatar>
                    {avatarLoading && (
                        <CircularProgress
                            size={84}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 1,
                            }}
                        />
                    )}
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Profile Picture
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        JPG, PNG, GIF up to 5MB
                    </Typography>
                    <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        disabled={avatarLoading}
                    >
                        Upload Photo
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </Button>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Box component="form" onSubmit={handleUpdateProfile}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Personal Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Update your public profile display name and notification email.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        sx={{ mb: 2.5 }}
                        required
                    />
                    <Button type="submit" variant="contained" disabled={loading}>
                        Save Changes
                    </Button>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Box component="form" onSubmit={handleChangePassword}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Security & Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ensure your account is using a secure, strong password.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={pwd.currentPassword}
                        onChange={handlePwdChange}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={pwd.newPassword}
                        onChange={handlePwdChange}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirm"
                        type="password"
                        value={pwd.confirm}
                        onChange={handlePwdChange}
                        sx={{ mb: 2.5 }}
                        required
                    />
                    <Button type="submit" variant="contained" disabled={loading}>
                        Update Password
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
