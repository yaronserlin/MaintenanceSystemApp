// src/components/Navbar/UserMenu.jsx
import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../utils/mediaUtils';

export default function UserMenu({ user }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();

    const handleOpen = e => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    if (!user) return null;

    const avatarSrc = getMediaUrl(user.avatar || user.avatarUrl);

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'mechanic': return 'secondary';
            default: return 'primary';
        }
    };

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account settings & profile">
                <IconButton
                    onClick={handleOpen}
                    sx={{
                        p: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'border-color 0.2s',
                        '&:hover': { borderColor: 'text.primary' },
                    }}
                >
                    <Avatar
                        alt={user.name}
                        src={avatarSrc}
                        sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 600, fontSize: '0.85rem' }}
                    >
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
                PaperProps={{
                    sx: { minWidth: 220, borderRadius: 2, p: 0.5 }
                }}
            >
                {/* User info header */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {user.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ mb: 0.75 }}>
                        {user.email}
                    </Typography>
                    {user.role && (
                        <Chip
                            label={user.role.toUpperCase()}
                            size="small"
                            color={getRoleColor(user.role)}
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                    )}
                </Box>
                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate('/account');
                    }}
                >
                    <ListItemIcon>
                        <ManageAccountsIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Account Settings</Typography>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate('/profile');
                    }}
                >
                    <ListItemIcon>
                        <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">My Activity</Typography>
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate('/logout');
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon sx={{ color: 'error.main' }}>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight="medium">
                        Log out
                    </Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
}