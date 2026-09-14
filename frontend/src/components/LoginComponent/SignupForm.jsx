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
    validateName,
    validateEmail,
    validatePassword,
} from '../../utils/validate';

export default function SignupForm() {
    const { signup, loading } = useAuth();
    const [serverError, setServerError] = useState('');

    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
    } = useForm({
        initialValues: { companyName: '', name: '', email: '', password: '' },
        validate: validateSignup,
        onSubmit: submitForm,
    });

    function validateSignup(vals) {
        const fieldErrors = {};
        if (!vals.companyName || vals.companyName.trim().length < 2) {
            fieldErrors.companyName = 'Company name must be at least 2 characters';
        }
        const nameErr = validateName(vals.name);
        if (nameErr) fieldErrors.name = nameErr;

        const emailErr = validateEmail(vals.email);
        if (emailErr) fieldErrors.email = emailErr;

        const pwdErr = validatePassword(vals.password);
        if (pwdErr) fieldErrors.password = pwdErr;

        return fieldErrors;
    }

    async function submitForm(vals) {
        setServerError('');
        try {
            await signup(vals);
            resetForm();
        } catch (err) {
            setServerError(err.message || 'Signup failed');
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
                <Input.Text
                    name="companyName"
                    label="Company Name"
                    value={values.companyName}
                    onChange={handleInputChange}
                    required
                    error={Boolean(errors.companyName)}
                    helperText={errors.companyName}
                />

                <Input.Text
                    name="name"
                    label="Admin Full Name"
                    value={values.name}
                    onChange={handleInputChange}
                    required
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                />

                <Input.Email
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleInputChange}
                    required
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                />

                <Input.Password
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleInputChange}
                    required
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting || loading ? 'Creating Company…' : 'Create Company'}
                </Button>
            </Box>
        </>
    );
}
