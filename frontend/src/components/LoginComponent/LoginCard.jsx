// src/components/Cards/LoginCard.jsx
import React from 'react';
import {
    Card,
    CardContent,
    Typography,
} from '@mui/material';

import LoginForm from './LoginForm';


export default function LoginCard() {

    return (
        <Card sx={{ minWidth: 275, maxWidth: 400, width: '100%' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
                <LoginForm />

            </CardContent>
        </Card>

    );
}
