import React from 'react';
import { Typography, Container, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NotFound() {
    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                gap: 2,
                p: 2,
            }}
        >
            <Typography variant="h1" component="h1" sx={{ fontWeight: '600', letterSpacing: '20px' }}>
                404
            </Typography>
            <Typography variant="h5" component="div" color="text.secondary">
                Page not found
            </Typography>
            <Button
                component={RouterLink}
                to="/"
                variant="contained"
                sx={{ mt: 2 }}
            >
                Return to home
            </Button>
        </Container>
    );
}

export default NotFound;
