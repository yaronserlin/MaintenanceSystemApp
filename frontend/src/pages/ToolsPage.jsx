// src/pages/ToolsPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toolsService from '../services/toolsService';
import ToolsList from '../components/Tool/ToolsList/ToolsList';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';

/**
 * Displays a list of tools and provides modals for create, update, and delete.
 */
export default function ToolsPage() {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sortBySerial = (arr) =>
        [...arr].sort((a, b) =>
            // If a or b is undefined, treat it as less than the other
            (a.localSerialNumber || '').localeCompare(b.localSerialNumber || '') ||
            // If localSerialNumber is the same, sort by name
            a.name.localeCompare(b.name)


        );

    useEffect(() => {
        toolsService
            .getAll()
            .then((data) => setTools(sortBySerial(data)))
            .catch((err) => {
                console.error(err);
                setError('Failed to load tools');
            })
            .finally(() => setLoading(false));
    }, []);

    if (error) {
        return (
            <ErrorComponent message={error} />
        )
    }

    if (loading) {
        return (
            <LoadingComponent />
        )
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Tools
            </Typography>
            <ToolsList tools={tools} />
        </Container>
    );
}