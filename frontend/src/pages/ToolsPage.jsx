import React from 'react';
import {
    Container,
    Typography,
} from '@mui/material';

import ToolsList from '../components/Tool/ToolsList/ToolsList';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';
import { useTool } from '../contexts/ToolContext';

/**
 * Displays a list of tools and provides modals for create, update, and delete.
 */
export default function ToolsPage() {
    // const { tools } = useTool();
    const { tools, loading, error } = useTool();

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