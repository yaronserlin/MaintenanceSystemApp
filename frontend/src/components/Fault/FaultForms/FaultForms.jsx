import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTool } from '../../../contexts/ToolContext';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

/**
 * Shared form fields for fault forms.
 */
function FaultFormFields({ values, onChange, tools = [] }) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {/* Tool selector */}
            <TextField
                label="Tool"
                name="tool"
                select
                SelectProps={{ native: true }}
                value={values.tool}
                onChange={onChange}
            >
                <option value="" disabled>
                    Select a tool
                </option>
                {tools.map(tool => (
                    <option key={tool._id} value={tool._id}>
                        {tool.name} {tool.localSerialNumber ? `(${tool.localSerialNumber})` : ''}
                    </option>
                ))}
            </TextField>

            {/* Fault code */}
            <TextField
                label="Code"
                name="code"
                required
                value={values.code}
                onChange={onChange}
            />

            {/* Detailed description */}
            <TextField
                label="Description"
                name="description"
                required
                multiline
                rows={4}
                value={values.description}
                onChange={onChange}
            />

            <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
            >
                {values.files && values.files.length > 0
                    ? `${values.files.length} file(s) selected`
                    : 'Upload Photos'}
                <VisuallyHiddenInput
                    type="file"
                    id="photosFiles"
                    name="photosFiles"
                    accept="image/*"
                    onChange={onChange}
                    multiple
                />
            </Button>

            {/* Photo URLs, comma-separated */}
            <TextField
                label="Photo URLs (optional, comma-separated)"
                name="photoUrls"
                helperText="Enter full URLs separated by commas"
                value={values.photoUrls}
                onChange={onChange}
            />

            {/* Status selector */}
            <TextField
                select
                label="Status"
                name="status"
                SelectProps={{ native: true }}
                value={values.status}
                onChange={onChange}
            >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
            </TextField>

            {/* Closed date, if status is closed */}
            {values.status === 'closed' && (
                <TextField
                    label="Closed At"
                    name="closedAt"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={values.closedAt}
                    onChange={onChange}
                />
            )}
        </Box>
    );
}

/**
 * Form for creating a new Fault.
 */
export function CreateFaultForm({ onSubmit, toolId }) {
    const { tools = [] } = useTool();
    const [values, setValues] = useState({
        tool: toolId || (tools.length > 0 ? tools[0]._id : ''),
        code: '',
        description: '',
        photoUrls: '',
        files: [],
        status: 'open',
        closedAt: '',
    });

    useEffect(() => {
        if (!values.tool && tools.length > 0) {
            setValues(prev => ({ ...prev, tool: toolId || tools[0]._id }));
        }
    }, [tools, toolId, values.tool]);

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            const selectedFiles = Array.from(e.target.files || []);
            setValues(prev => ({ ...prev, files: selectedFiles }));
        } else {
            const { name, value } = e.target;
            setValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.description.trim()) return;

        const photosFromUrls = values.photoUrls
            ? values.photoUrls.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        onSubmit({
            tool: values.tool,
            code: values.code,
            description: values.description,
            photos: photosFromUrls,
            files: values.files,
            status: values.status,
            closedAt: values.status === 'closed' && values.closedAt
                ? new Date(values.closedAt)
                : undefined,
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
            <FaultFormFields values={values} onChange={handleChange} tools={tools} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Create Fault
                </Button>
            </Box>
        </Box>
    );
}

export default CreateFaultForm;
