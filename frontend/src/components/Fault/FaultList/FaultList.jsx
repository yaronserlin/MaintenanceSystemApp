// src/components/FaultList.jsx
import React from 'react';
import { Grid, Typography } from '@mui/material';
import FaultCard from '../FaultCard/FaultCard';

export default function FaultList({ faults, onFaultClick, onCloseFault, onDeleteFault }) {
    if (!faults || faults.length === 0) {
        return <Typography>No faults recorded for this tool.</Typography>;
    }
    return (
        <Grid container spacing={2}>
            {faults.map((fault) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>

                    <FaultCard
                        fault={fault}
                        onClick={onFaultClick}
                        onCloseFault={onCloseFault}
                        onDeleteFault={onDeleteFault}
                    />
                </Grid>
            ))}
        </Grid>
    );
}