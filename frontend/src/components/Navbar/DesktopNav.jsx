// src/components/Navbar/DesktopNav.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

export default function DesktopNav({ display, user, pages }) {
    const location = useLocation();
    if (!user) return null;

    return (
        <>
            <Box
                component={RouterLink}
                to="/dashboard"
                sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 1.25,
                    mr: 4,
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        borderRadius: 1,
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        color: 'text.primary',
                    }}
                >
                    <BuildCircleIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            lineHeight: 1.1,
                            color: 'text.primary',
                        }}
                    >
                        MAINTENANCE
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            fontSize: '0.62rem',
                            color: 'text.secondary',
                            display: 'block',
                        }}
                    >
                        {user?.role === 'operator' ? 'OPERATOR PORTAL' : 'OPS MANAGER'}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display, gap: 1 }}>
                {pages.map(page => {
                    const targetPath = (page.toLowerCase() === 'faults' || page.toLowerCase() === 'my faults')
                        ? '/dashboard'
                        : `/${page.toLowerCase()}`;
                    const isActive = location.pathname === targetPath || (targetPath !== '/dashboard' && location.pathname.startsWith(targetPath));

                    return (
                        <Button
                            key={page}
                            component={RouterLink}
                            to={targetPath}
                            sx={{
                                my: 1.5,
                                px: 1.75,
                                py: 0.6,
                                color: isActive ? 'text.primary' : 'text.secondary',
                                bgcolor: isActive ? (theme) => alpha(theme.palette.text.primary, 0.06) : 'transparent',
                                borderBottom: isActive ? (theme) => `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
                                borderRadius: '4px 4px 0 0',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.875rem',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    color: 'text.primary',
                                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                },
                            }}
                        >
                            {page}
                        </Button>
                    );
                })}
            </Box>
        </>
    );
}