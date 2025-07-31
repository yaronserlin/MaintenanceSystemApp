// src/components/FaultDetailsDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
} from '@mui/material';

export default function FaultDetailsDialog({ open, onClose, fault }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Fault Details</DialogTitle>
            <DialogContent dividers>
                {fault && (
                    <List>
                        <ListItem>
                            <ListItemText primary="Code" secondary={fault.code || 'N/A'} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Description" secondary={fault.description} />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Operator"
                                secondary={fault.operator?.name || fault.operator || 'N/A'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Status" secondary={fault.status} />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Reported At"
                                secondary={new Date(fault.createdAt).toLocaleString("en-GB")}
                            />
                        </ListItem>
                        {fault.status === 'closed' && (
                            <ListItem>
                                <ListItemText
                                    primary="Closed At"
                                    secondary={
                                        fault.closedAt ? new Date(fault.closedAt).toLocaleString("en-GB") : 'N/A'
                                    }
                                />
                            </ListItem>
                        )}
                        {fault.photos?.length > 0 && (
                            <ListItem>
                                <ListItemText primary="Photos" secondary={fault.photos.join(', ')} />
                            </ListItem>
                        )}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}