import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { useAuth } from '../../contexts/AuthContext';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';
import UserMenu from './UserMenu';



function Navbar({ pages, settings }) {
    const { user } = useAuth()
    if (!user) {
        console.warn('User is not authenticated, Navbar will not render user-specific content');
    }
    if (!pages || !Array.isArray(pages)) {
        console.error('Invalid pages prop provided to Navbar');
    }
    if (!settings || !Array.isArray(settings)) {
        console.error('Invalid settings prop provided to Navbar');
    }
    if (pages.length === 0) {
        console.warn('No pages provided to Navbar');
    }
    if (settings.length === 0) {
        console.warn('No settings provided to Navbar');
    }
    if (user && !user.role) {
        console.warn('User role is undefined, Navbar may not display correctly');
    }
    if (user && user.role === 'admin') {
        console.log('Admin user detected, Navbar will display admin options');
        
        if (!pages.includes('Admin')) {
            console.warn('Admin page not found in pages prop, adding Admin page');
            pages.push('Admin');
        }
    }
    else {
        console.log('Regular user detected, Navbar will display standard options');
        pages = pages.filter(page => page !== 'Admin'); // Ensure Admin page is not included for non-admin users
    }

    return (
        <AppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <MobileNav display={{ xs: 'flex', md: 'none' }} user={user} pages={pages} />
                    <DesktopNav display={{ xs: 'none', md: 'flex' }} user={user} pages={pages} />
                    <UserMenu user={user} settings={settings} pages={pages} />
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Navbar;
