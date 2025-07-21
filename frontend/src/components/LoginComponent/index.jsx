// src/components/Cards/LoginCard.jsx
import React from 'react';

import Container from '@mui/material/Container';
import LoginCard from './LoginCard';


export default function LoginComponent() {


    return (
        <Container
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                p: 2,
            }}
        >
            <LoginCard />
        </Container>
    );
}
