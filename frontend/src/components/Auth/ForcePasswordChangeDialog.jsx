import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';

export default function ForcePasswordChangeDialog() {
    const { user, setUser, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const open = Boolean(user && user.mustChangePassword);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentPassword) {
            setError('Please enter your current temporary password');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/me/change-password', {
                currentPassword,
                newPassword,
            });
            setUser(prev => ({ ...prev, mustChangePassword: false }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            maxWidth="xs"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    p: 1,
                    borderRadius: 3,
                    boxShadow: 24,
                },
            }}
        >
            <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: 'warning.light',
                        color: 'warning.contrastText',
                        display: 'flex',
                    }}
                >
                    <LockResetIcon />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Password Change Required
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        First-time security setup
                    </Typography>
                </Box>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
                        Welcome to the system! For security reasons, please set a new personal password before accessing your account.
                    </Alert>

                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        fullWidth
                        label="Current Temporary Password"
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        autoFocus
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowCurrent(p => !p)}
                                        edge="end"
                                        size="small"
                                        aria-label="toggle current password visibility"
                                    >
                                        {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="New Password (min 6 characters)"
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowNew(p => !p)}
                                        edge="end"
                                        size="small"
                                        aria-label="toggle new password visibility"
                                    >
                                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirm(p => !p)}
                                        edge="end"
                                        size="small"
                                        aria-label="toggle confirm password visibility"
                                    >
                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, flexDirection: 'column', gap: 1 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ minHeight: 44, fontWeight: 700 }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Set New Password & Continue'}
                    </Button>
                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        onClick={logout}
                        disabled={loading}
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                    >
                        Log out and return to sign in
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
