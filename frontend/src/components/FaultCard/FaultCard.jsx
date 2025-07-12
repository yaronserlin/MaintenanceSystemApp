// src/components/FaultCard/FaultCard.jsx
import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';


export default function FaultCard({ fault }) {
    const navigate = useNavigate();
    const { _id, title, status, createdAt, tool, description, operator, code, closedAt, photos, updatedAt } = fault;

    // Format date
    const formattedCreatedDate = new Date(createdAt).toLocaleDateString();
    const formattedUpdateDate = new Date(updatedAt).toLocaleDateString();
    const formattedCloseDate = new Date(closedAt).toLocaleDateString();

    // Determine chip color based on status
    const chipColor = status === 'open' ? 'error' : 'success';

    return (
        <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                    {code}
                </Typography>
                <Chip label={status.toUpperCase()} color={chipColor} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    Created: {formattedCreatedDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {status === 'open' ? 'Last Update ' + formattedUpdateDate : 'Closed: ' + formattedCloseDate}
                </Typography>
            </CardContent>

            <CardActions>
                <Button size="small" onClick={() => navigate(`/tools/${tool._id}`)}>
                    View Tool
                </Button>
                <Button size="small" onClick={() => console.log(fault)
                }>
                    Details
                </Button>
            </CardActions>
        </Card >
    );
}
