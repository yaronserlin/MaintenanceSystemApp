// src/components/LoginComponent/LoginCard.jsx
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
} from '@mui/material';

import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function LoginCard() {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'

    return (
        <Card sx={{ minWidth: 275, maxWidth: 450, width: '100%' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {mode === 'login' ? 'Login' : 'Create Company'}
                </Typography>

                {mode === 'login' ? <LoginForm /> : <SignupForm />}

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    >
                        {mode === 'login'
                            ? "Don't have a company account? Sign up"
                            : 'Already have an account? Log in'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
