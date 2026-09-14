// src/components/LoadingComponent/LoadingComponent.jsx
import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';

export default function LoadingComponent({ message = '' }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 240,
                gap: 2,
                py: 6,
            }}
        >
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress
                    size={48}
                    thickness={3.5}
                    sx={{ color: 'primary.main' }}
                />
                <BuildCircleIcon
                    sx={{
                        position: 'absolute',
                        fontSize: 20,
                        color: 'primary.main',
                        opacity: 0.7,
                    }}
                />
            </Box>
            {message && (
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {message}
                </Typography>
            )}
        </Box>
    );
}
