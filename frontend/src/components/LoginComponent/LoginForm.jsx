import React, { useState } from 'react';
import {
    Button,
    Box,
    Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import Input from '../Form/Input';
import {
    validateEmail,
    validatePassword,
} from '../../utils/validate';

/**
 * LoginForm component handles user authentication.
 */
export default function LoginForm() {
    const { login, loading } = useAuth();
    const [serverError, setServerError] = useState('');

    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
    } = useForm({
        initialValues: { email: '', password: '' },
        validate: validateLogin,
        onSubmit: submitForm,
    });

    function validateLogin(vals) {
        const fieldErrors = {};
        const emailErr = validateEmail(vals.email);
        if (emailErr) fieldErrors.email = emailErr;
        const pwdErr = validatePassword(vals.password);
        if (pwdErr) fieldErrors.password = pwdErr;
        return fieldErrors;
    }

    async function submitForm(vals) {
        setServerError('');
        try {
            await login(vals.email, vals.password);
            resetForm();
        } catch (err) {
            setServerError(err.message || 'Login failed');
        }
    }

    function handleInputChange(e) {
        if (serverError) {
            setServerError('');
        }
        handleChange(e);
    }

    return (
        <>
            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <Input.Email
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleInputChange}
                    required
                    error={errors.email}
                    helperText={errors.email}
                />

                <Input.Password
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleInputChange}
                    required
                    error={errors.password}
                    helperText={errors.password}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting || loading ? 'Logging in...' : 'Login'}
                </Button>
            </Box>
        </>
    );
}
