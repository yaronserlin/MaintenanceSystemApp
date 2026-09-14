// src/components/Navbar/index.jsx
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';
import UserMenu from './UserMenu';

export default function Navbar({ pages = [] }) {
    const { user } = useAuth();
    const { mode, toggleColorMode } = useThemeMode();

    const navPages = useMemo(() => {
        if (user?.role === 'operator') {
            return ['My Faults', 'Account'];
        }
        let result = [...pages];
        if (user?.role === 'admin') {
            if (!result.includes('Admin')) result.push('Admin');
        } else {
            result = result.filter(p => p !== 'Admin');
        }
        return result;
    }, [pages, user?.role]);

    return (
        <AppBar position="sticky" elevation={0}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
                    <MobileNav display={{ xs: 'flex', sm: 'none' }} user={user} pages={navPages} />
                    <DesktopNav display={{ xs: 'none', sm: 'flex' }} user={user} pages={navPages} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                        <Tooltip title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
                            <IconButton
                                onClick={toggleColorMode}
                                aria-label="Toggle dark/light mode"
                                sx={{
                                    color: 'text.primary',
                                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1) },
                                    p: 1,
                                }}
                            >
                                {mode === 'dark' ? (
                                    <LightModeIcon sx={{ fontSize: 20 }} />
                                ) : (
                                    <DarkModeIcon sx={{ fontSize: 20 }} />
                                )}
                            </IconButton>
                        </Tooltip>

                        {user && <UserMenu user={user} />}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}