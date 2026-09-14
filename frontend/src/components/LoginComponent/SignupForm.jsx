// src/components/LoginComponent/SignupForm.jsx
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import { validateName, validateEmail, validatePassword } from '../../utils/validate';

function validateSignup(vals) {
    const errs = {};
    if (!vals.companyName || vals.companyName.trim().length < 2) {
        errs.companyName = 'Company name must be at least 2 characters';
    }
    const nameErr = validateName(vals.name);
    if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(vals.email);
    if (emailErr) errs.email = emailErr;
    const pwdErr = validatePassword(vals.password);
    if (pwdErr) errs.password = pwdErr;
    return errs;
}

export default function SignupForm() {
    const { signup, loading } = useAuth();
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm } = useForm({
        initialValues: { companyName: '', name: '', email: '', password: '' },
        validate: validateSignup,
        onSubmit: async (vals) => {
            setServerError('');
            try {
                await signup(vals);
                resetForm();
            } catch (err) {
                setServerError(err.message || 'Sign up failed. Please try again.');
            }
        },
    });

    const handleInputChange = (e) => {
        if (serverError) setServerError('');
        handleChange(e);
    };

    const busy = isSubmitting || loading;

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
            {serverError && (
                <Alert
                    severity="error"
                    onClose={() => setServerError('')}
                    sx={{ borderRadius: 2 }}
                >
                    {serverError}
                </Alert>
            )}

            {/* Company Name */}
            <TextField
                name="companyName"
                label="Company name"
                value={values.companyName}
                onChange={handleInputChange}
                required
                fullWidth
                error={Boolean(errors.companyName)}
                helperText={errors.companyName}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <BusinessIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Full Name */}
            <TextField
                name="name"
                label="Admin full name"
                autoComplete="name"
                value={values.name}
                onChange={handleInputChange}
                required
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Email */}
            <TextField
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                value={values.email}
                onChange={handleInputChange}
                required
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Password */}
            <TextField
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                autoComplete="new-password"
                value={values.password}
                onChange={handleInputChange}
                required
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                edge="end"
                                tabIndex={-1}
                            >
                                {showPassword
                                    ? <VisibilityOff sx={{ fontSize: 18 }} />
                                    : <Visibility sx={{ fontSize: 18 }} />
                                }
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {/* Submit */}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={busy}
                fullWidth
                sx={{
                    mt: 0.5,
                    minHeight: 48,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                }}
            >
                {busy ? (
                    <CircularProgress size={20} thickness={5} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                ) : 'Create Company Account'}
            </Button>
        </Box>
    );
}
