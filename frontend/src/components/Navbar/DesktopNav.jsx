import * as React from 'react';
import Typography from '@mui/material/Typography';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
export default function DesktopNav({ display, user, pages }) {
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);



    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <>
            <AgricultureIcon sx={{ display: display, mr: 1 }} />
            <Typography
                variant="h6"
                noWrap
                component="a"
                href="#"
                onClick={() => navigate('/')}
                sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
            >
                MAINTENANCE APP
            </Typography>
            {user && <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                    <Button
                        key={page}
                        onClick={(event) => { handleCloseNavMenu(event), navigate(page) }}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        {page}
                    </Button>


                ))}
            </Box>}
        </>
    )
}