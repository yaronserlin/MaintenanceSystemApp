// src/components/Fault/FaultList/FaultList.jsx
import React from 'react';
import {
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext';

export default function FaultList({ faults, onFaultClick, onCloseFault, onDeleteFault }) {
    const { user } = useAuth();

    const isUserAuthorized = () => {
        if (!user) return false;
        return user.role === 'admin' || user.role === 'mechanic';
    };

    if (!faults || faults.length === 0) {
        return <Typography color="text.secondary">No faults recorded for this tool.</Typography>;
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Reported</TableCell>
                        {isUserAuthorized() && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {faults.map((fault) => (
                        <TableRow
                            key={fault._id}
                            tabIndex={0}
                            role="button"
                            aria-label={`View fault ${fault.code || ''}`}
                            onClick={() => onFaultClick?.(fault)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onFaultClick?.(fault);
                                }
                            }}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                '&:focus-visible': { outline: '2px solid primary.main' },
                            }}
                        >
                            <TableCell>
                                {fault.status === 'closed' ? (
                                    <Typography color="success.main">Closed</Typography>
                                ) : (
                                    <Typography color="error.main">Open</Typography>
                                )}
                            </TableCell>
                            <TableCell>{fault.code || 'N/A'}</TableCell>
                            <TableCell>{fault.description || 'No description provided'}</TableCell>
                            <TableCell>
                                {fault.createdAt ? new Date(fault.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                            </TableCell>
                            {isUserAuthorized() && (
                                <TableCell align="right">
                                    <IconButton
                                        aria-label={fault.status === 'closed' ? 'Fault closed' : 'Close fault'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCloseFault?.(fault);
                                        }}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteFault?.(fault);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}