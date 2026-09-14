// src/components/LoginComponent.jsx
import React from 'react';

import Container from '@mui/material/Container';
import LoginCard from './LoginCard';


export default function LoginComponent() {
    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100dvh - 120px)',
                py: { xs: 4, sm: 6 },
                px: 2,
            }}
        >
            <LoginCard />
        </Container>
    );
}
