import React from 'react';
import {
    Container,
    Typography,
} from '@mui/material';
import ToolsList from '../components/Tool/ToolsList/ToolsList';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent/ErrorComponent';
import { useEquipment } from '../contexts/EquipmentContext';

/**
 * Displays a list of equipment and provides navigation to equipment details.
 */
export default function EquipmentsPage() {
    const { equipment, loading, error } = useEquipment();

    if (error) {
        return <ErrorComponent message={error} />;
    }

    if (loading) {
        return <LoadingComponent />;
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Equipment
            </Typography>
            <ToolsList tools={equipment} />
        </Container>
    );
}
