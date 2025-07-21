import React, { use, useContext } from 'react';
import {
    Card,
    CardActionArea,
    CardContent,
    CardActions,
    IconButton,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext';
export default function FaultCard({ fault, onClick, onCloseFault, onDeleteFault }) {
    const { user } = useAuth();


    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardActionArea onClick={() => onClick(fault)} sx={{ flexGrow: 1 }}>
                <CardContent>
                    <Typography variant="h6">{fault.code || 'Fault'}</Typography>
                    <Typography variant="body2" gutterBottom>
                        {fault.description}
                    </Typography>

                    <Typography variant="caption" display="block">
                        Status: {fault.status}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Reported: {new Date(fault.createdAt).toLocaleDateString('en-GB')}
                    </Typography>
                </CardContent>
            </CardActionArea>
            {user && (user.role === 'admin' || user.role === 'mechanic') && (
                <CardActions>
                    <IconButton
                        onClick={() => onCloseFault(fault)}
                        title={fault.status === 'closed' ? 'Fault closed' : 'Close fault'}
                        sx={{ color: fault.status === 'closed' ? 'success.main' : 'error.main' }}
                    >
                        {fault.status === 'closed' ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    </IconButton>
                    <IconButton aria-label="delete fault" onClick={() => onDeleteFault(fault)}>
                        <DeleteIcon />
                    </IconButton>
                </CardActions>
            )}

        </Card>
    );
}
