import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

// Generic form fields component (used by both create and update forms)
function ToolFormFields({ values, onChange }) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <TextField
                label="Name"
                name="name"
                required
                value={values.name}
                onChange={onChange}
            />
            <TextField
                label="Serial Number"
                name="serialNumber"
                value={values.serialNumber}
                onChange={onChange}
            />
            <TextField
                label="Local Serial Number"
                name="localSerialNumber"
                value={values.localSerialNumber}
                onChange={onChange}
            />
            <TextField
                label="Model"
                name="model"
                value={values.model}
                onChange={onChange}
            />
            <TextField
                label="Description"
                name="description"
                multiline
                rows={4}
                value={values.description}
                onChange={onChange}
            />
        </Box>
    );
}

// Create Tool Form Component
export function CreateToolForm({ onSubmit }) {
    const [values, setValues] = useState({
        name: '',
        serialNumber: '',
        loacalSerialNumber: '',
        model: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        onSubmit(values);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>

            <ToolFormFields values={values} onChange={handleChange} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Create
                </Button>
            </Box>
        </Box>
    );
}

// Update Tool Form Component
export function UpdateToolForm({ initialData = {}, onSubmit }) {
    const [values, setValues] = useState({
        name: '',
        serialNumber: '',
        localSerialNumber: '',
        model: '',
        description: '',
    });

    useEffect(() => {
        if (initialData) {
            setValues({
                name: initialData.name || '',
                serialNumber: initialData.serialNumber || '',
                localSerialNumber: initialData.localSerialNumber || '',
                model: initialData.model || '',
                description: initialData.description || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        onSubmit(values);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
            <ToolFormFields values={values} onChange={handleChange} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Update
                </Button>
            </Box>
        </Box>
    );
}
