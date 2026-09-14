// src/components/ToolsList/ToolsList.jsx
import React from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Box,
    IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

/**
 * Displays a list of all tools. Clicking a tool navigates to its detail page,
 * clicking the edit icon selects it for update, and clicking the delete icon
 * triggers the deletion flow.
 */
export default function ToolsList({ tools }) {
    const navigate = useNavigate();

    if (tools.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography color="text.secondary">No equipment available.</Typography>
            </Container>
        );
    }

    return (
        <List>
            {tools.map((tool, index) => (
                <React.Fragment key={tool._id}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate(`/equipment/${tool._id}`)}>
                            <ListItemText
                                primary={`${tool.localSerialNumber ? tool.localSerialNumber + ' - ' : ''}${tool.name}`}
                                secondary={
                                    `${tool.model ? 'Model: ' + tool.model + ' | ' : ''}` +
                                    `${tool.serialNumber ? 'Serial: ' + tool.serialNumber + ' | ' : ''}` +
                                    `${tool.currentEngineHours ? 'Hours: ' + tool.currentEngineHours + ' hrs | ' : ''}` +
                                    `${tool.description || ''}`
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                    {index < tools.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    );
}