// src/components/Navbar/UserMenu.jsx
import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../utils/mediaUtils';

export default function UserMenu({ user, settings = [] }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();

    const handleOpen = e => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    if (!user) return null;

    const avatarSrc = getMediaUrl(user.avatar || user.avatarUrl);

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpen} sx={{ p: 0 }}>
                    <Avatar alt={user.name} src={avatarSrc}>
                        {user.name?.charAt(0)}
                    </Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {settings.map(setting => (
                    <MenuItem
                        key={setting}
                        onClick={() => {
                            handleClose();
                            navigate(`/${setting.toLowerCase()}`);
                        }}
                    >
                        <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}