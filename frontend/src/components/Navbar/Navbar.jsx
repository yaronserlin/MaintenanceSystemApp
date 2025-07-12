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
