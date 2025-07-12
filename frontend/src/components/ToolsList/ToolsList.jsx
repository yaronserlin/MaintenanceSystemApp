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
export default function ToolsList({ tools, onSelect, onDelete }) {
    const navigate = useNavigate();

    if (tools.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>No tools available.</Typography>
            </Container>
        );
    }

    return (
        <List>
            {tools.map((tool, index) => (
                <React.Fragment key={tool._id}>
                    <ListItem
                        disablePadding
                        secondaryAction={
                            <Box>
                                <IconButton edge="end" aria-label="edit" onClick={() => onSelect(tool)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => onDelete(tool)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemButton onClick={() => navigate(`/tools/${tool._id}`)}>
                            <ListItemText
                                primary={`${tool.localSerialNumber ? tool.localSerialNumber + ' - ' : ''}${tool.name}`}
                                secondary={
                                    `${tool.model ? 'Model: ' + tool.model + ' - ' : ''}` +
                                    `${tool.serialNumber ? 'Serial Number: ' + tool.serialNumber + ' - ' : ''}` +
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