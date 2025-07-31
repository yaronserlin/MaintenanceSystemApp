// src/components/FaultList.jsx
import React, { use } from 'react';
import {
    Grid,
    Typography,
    Paper,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    IconButton,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import FaultCard from '../FaultCard/FaultCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext';

export default function FaultList({ faults, onFaultClick, onCloseFault, onDeleteFault }) {
    const { user } = useAuth();

    const isUserAuthorized = () => {
        if (!user) return false;
        return user.role === 'admin' || user.role === 'mechanic';
    }

    if (!faults || faults.length === 0) {
        return <Typography>No faults recorded for this tool.</Typography>;
    }
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell >Reported</TableCell>

                        {isUserAuthorized() && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {faults.map((fault) => (
                        <TableRow key={fault._id} onClick={() => onFaultClick(fault)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                            <TableCell>
                                {fault.status === 'closed' ? (
                                    <Typography color="success.main">Closed</Typography>
                                ) : (
                                    <Typography color="error.main">Open</Typography>
                                )}
                            </TableCell>
                            <TableCell>{fault.code || 'N/A'}</TableCell>
                            <TableCell>{fault.description || 'No description provided'}</TableCell>
                            <TableCell> {new Date(fault.createdAt).toLocaleDateString('en-GB')}</TableCell>
                            {isUserAuthorized() && <TableCell align="right">
                                <IconButton
                                    onClick={() => onCloseFault(fault)}
                                    title={fault.status === 'closed' ? 'Fault closed' : 'Close fault'}
                                    sx={{ color: fault.status === 'closed' ? 'success.main' : 'error.main' }}
                                >
                                    {fault.status === 'closed' ? (

                                        <CheckCircleIcon />
                                    ) : (
                                        <RadioButtonUncheckedIcon />
                                    )}
                                </IconButton>
                                <IconButton
                                    aria-label="delete fault"
                                    onClick={() => onDeleteFault(fault)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>}
                        </TableRow>
                    ))
                    }

                </TableBody>
            </Table>
        </TableContainer>


    );
}