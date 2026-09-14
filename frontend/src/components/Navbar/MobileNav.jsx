// src/components/Navbar/MobileNav.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

export default function MobileNav({ display, user, pages }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleOpen = e => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Box sx={{ flexGrow: 1, display }}>
                {user && (
                    <>
                        <IconButton
                            size="medium"
                            onClick={handleOpen}
                            aria-label="Open navigation menu"
                            sx={{ mr: 1, color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: { minWidth: 180, mt: 1, borderRadius: 2 }
                            }}
                        >
                            {pages.map(page => {
                                const targetPath = (page.toLowerCase() === 'faults' || page.toLowerCase() === 'my faults')
                                    ? '/dashboard'
                                    : `/${page.toLowerCase()}`;
                                const isActive = location.pathname === targetPath || (targetPath !== '/dashboard' && location.pathname.startsWith(targetPath));

                                return (
                                    <MenuItem
                                        key={page}
                                        selected={isActive}
                                        onClick={() => {
                                            handleClose();
                                            navigate(targetPath);
                                        }}
                                        sx={{ py: 1.25 }}
                                    >
                                        <Typography fontWeight={isActive ? 700 : 500} color="text.primary">
                                            {page}
                                        </Typography>
                                    </MenuItem>
                                );
                            })}
                        </Menu>
                    </>
                )}
            </Box>

            <Box
                component={RouterLink}
                to="/dashboard"
                sx={{
                    display,
                    alignItems: 'center',
                    gap: 1,
                    flexGrow: 1,
                    textDecoration: 'none',
                    color: 'text.primary',
                }}
            >
                <BuildCircleIcon sx={{ color: 'text.primary', fontSize: 24 }} />
                <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        color: 'text.primary',
                    }}
                >
                    MAINTENANCE
                </Typography>
            </Box>
        </>
    );
}