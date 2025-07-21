// src/components/Cards/LoginCard.jsx
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import Container from '@mui/material/Container';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import Input from '../From/Input';
import {
    validateEmail,
    validatePassword,
} from '../../utils/validate';

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
        validate: (values) => validate(values),
        onSubmit: (values) => submit(values),
    });

    const validate = (values) => {
        const errs = {};
        // required + email format
        const emailError = validateEmail(values.email);
        if (emailError) errs.email = emailError;
        // required + strength
        const pwdError = validatePassword(values.password);
        if (pwdError) errs.password = pwdError;
        return errs;
    }

    const submit = async (values) => {
        setServerError('');
        try {
            await login(values.email, values.password);
            resetForm();
        } catch (err) {
            setServerError(err.message);
        }
    }

    // Wrap handleChange to also clear serverError on any new keystroke
    const handleInputChange = (e) => {
        if (serverError) setServerError('');
        handleChange(e);
    };

    return (
        <>

            {/* Server-side error alert */}
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
                    error={!!errors.email}
                    helperText={errors.email}
                />

                <Input.Password
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleInputChange}
                    required
                    error={!!errors.password}
                />
                {/* If you want to display password‐field validation under the input: */}
                {errors.password && (
                    <Typography variant="caption" color="error">
                        {errors.password}
                    </Typography>
                )}

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
