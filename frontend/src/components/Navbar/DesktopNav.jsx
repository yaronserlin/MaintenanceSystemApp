// src/components/Navbar/DesktopNav.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useNavigate } from 'react-router-dom';

export default function DesktopNav({ display, user, pages }) {
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <>
            <AgricultureIcon sx={{ display, mr: 1 }} />
            <Typography
                variant="h6"
                noWrap
                component="div"
                onClick={() => navigate('/')}
                sx={{
                    mr: 2,
                    display,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    cursor: 'pointer',
                }}
            >
                MAINTENANCE APP
            </Typography>
            <Box sx={{ flexGrow: 1, display }}>
                {pages.map(page => (
                    <Button
                        key={page}
                        onClick={() => navigate(`/${page.toLowerCase()}`)}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        {page}
                    </Button>
                ))}
            </Box>
        </>
    );
}