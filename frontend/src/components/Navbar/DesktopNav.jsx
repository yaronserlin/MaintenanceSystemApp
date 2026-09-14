// src/components/Navbar/DesktopNav.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const PAGE_TO_PATH = (page) => {
    const lower = page.toLowerCase();
    if (lower === 'dashboard') return '/dashboard';
    if (lower === 'my reports' || lower === 'reports' || lower === 'my faults' || lower === 'faults') return '/my-reports';
    if (lower === 'manuals' || lower === 'equipment manuals' || lower === 'books') return '/manuals';
    if (lower === 'equipment' || lower === 'tools') return '/equipment';
    if (lower === 'admin') return '/admin';
    return `/${lower}`;
};

export default function DesktopNav({ display, user, pages }) {
    const location = useLocation();
    if (!user) return null;

    return (
        <>
            {/* ── Brand Logo ─────────────────────────────────── */}
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
                    flexShrink: 0,
                    '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        borderRadius: 1,
                    },
                }}
            >
                {/* Blue logo badge */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        flexShrink: 0,
                    }}
                >
                    <BuildCircleIcon sx={{ fontSize: 20 }} />
                </Box>

                <Box>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            lineHeight: 1.1,
                            color: 'text.primary',
                            fontSize: '0.875rem',
                        }}
                    >
                        MAINTENANCE
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            fontSize: '0.6rem',
                            color: 'text.secondary',
                            display: 'block',
                            textTransform: 'uppercase',
                        }}
                    >
                        {user?.role === 'operator' ? 'Operator Portal' : 'Ops Manager'}
                    </Typography>
                </Box>
            </Box>

            {/* ── Nav Links ──────────────────────────────────── */}
            <Box sx={{ flexGrow: 1, display, gap: 0.5, alignItems: 'center' }}>
                {pages.map(page => {
                    const targetPath = PAGE_TO_PATH(page);
                    const isActive =
                        location.pathname === targetPath ||
                        (targetPath !== '/dashboard' && location.pathname.startsWith(targetPath));

                    return (
                        <Button
                            key={page}
                            component={RouterLink}
                            to={targetPath}
                            disableRipple={false}
                            sx={{
                                my: 1,
                                px: 1.75,
                                py: 0.75,
                                color: isActive ? 'primary.main' : 'text.secondary',
                                bgcolor: isActive
                                    ? (theme) => alpha(theme.palette.primary.main, 0.08)
                                    : 'transparent',
                                borderBottom: isActive
                                    ? (theme) => `2px solid ${theme.palette.primary.main}`
                                    : '2px solid transparent',
                                borderRadius: '6px 6px 0 0',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.875rem',
                                minHeight: 40,
                                transition: 'color 0.15s ease, background-color 0.15s ease',
                                '&:hover': {
                                    color: 'primary.main',
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                                    opacity: 1,
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