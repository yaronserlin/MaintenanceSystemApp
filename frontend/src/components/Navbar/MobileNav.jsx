// src/components/Navbar/MobileNav.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useNavigate } from 'react-router-dom';

export default function MobileNav({ display, user, pages }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleOpen = e => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    if (!user) return null;

    return (
        <>
            <Box sx={{ flexGrow: 1, display }}>
                <IconButton size="large" onClick={handleOpen} color="inherit">
                    <MenuIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    sx={{ display: { xs: 'block', md: 'none' } }}
                >
                    {pages.map(page => (
                        <MenuItem
                            key={page}
                            onClick={() => {
                                handleClose();
                                navigate(`/${page.toLowerCase()}`);
                            }}
                        >
                            <Typography textAlign="center">{page}</Typography>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
            <AgricultureIcon sx={{ display, mr: 1 }} />
            <Typography
                variant="h5"
                noWrap
                component="a"
                href="/"
                sx={{
                    mr: 2,
                    display,
                    flexGrow: 1,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
            >
                MAINTENANCE
            </Typography>
        </>
    );
}