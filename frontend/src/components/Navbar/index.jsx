// src/components/Navbar/index.jsx
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { useAuth } from '../../contexts/AuthContext';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';
import UserMenu from './UserMenu';

export default function Navbar({ pages = [], settings = [] }) {
    const { user } = useAuth();

    const navPages = useMemo(() => {
        let result = [...pages];
        if (user?.role === 'admin') {
            if (!result.includes('Admin')) result.push('Admin');
        } else {
            result = result.filter(p => p !== 'Admin');
        }
        return result;
    }, [pages, user?.role]);

    return (
        <AppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <MobileNav display={{ xs: 'flex', md: 'none' }} user={user} pages={navPages} />
                    <DesktopNav display={{ xs: 'none', md: 'flex' }} user={user} pages={navPages} />
                    <UserMenu user={user} settings={settings} />
                </Toolbar>
            </Container>
        </AppBar>
    );
}