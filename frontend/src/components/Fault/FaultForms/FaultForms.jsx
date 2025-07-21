import React, { useState, useEffect } from 'react';
import { Box, TextField, Button } from '@mui/material';
import toolsService from '../../../services/toolsService';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
 * Shared form fields for both create and update fault forms.
 * @param {{ values: Object, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }} props
 */
function FaultFormFields({ values, onChange }) {
    const [tools, setTools] = useState([]);
    useEffect(() => {
        // Fetch tools from an API or service
        async function fetchTools() {
            try {
                const response = await toolsService.getAll();
                setTools(response);
            } catch (error) {
                console.error('Error fetching tools:', error);
            }
        }
        fetchTools();
    }, []);

    useEffect(() => {
        if (tools.length && !values.tool) {
            onChange({ target: { name: 'tool', value: tools[0]._id } });
        }
    }, [tools]);
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
                        {tool.name} ({tool.localSerialNumber})
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
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
            >
                Upload files
                <VisuallyHiddenInput
                    type="file"
                    id='photos'
                    name="photos"

                    onChange={onChange}
                    multiple
                />
            </Button>


            {/* Photo URLs, comma-separated */}
            <TextField
                label="Photos (comma-separated URLs)"
                name="photos"
                helperText="Enter full URLs separated by commas"
                value={values.photos}
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
            <TextField
                label="Closed At"
                name="closedAt"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={values.closedAt}
                onChange={onChange}
                disabled={values.status !== 'closed'}
            />
        </Box>
    );
}

/**
 * Form for creating a new Fault.
 * @param {{ onSubmit: (faultData: any) => void }} props
 */
export function CreateFaultForm({ onSubmit, toolId }) {
    const [values, setValues] = useState({
        tool: toolId || "",
        code: '',
        description: '',
        photos: '',
        status: 'open',
        closedAt: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.code.trim() || !values.description.trim()) return;

        onSubmit({
            tool: values.tool,
            code: values.code,
            description: values.description,
            photos: values.photos
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            status: values.status,
            closedAt:
                values.status === 'closed' && values.closedAt
                    ? new Date(values.closedAt)
                    : undefined,
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
            <FaultFormFields values={values} onChange={handleChange} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Create Fault
                </Button>
            </Box>
        </Box>
    );
}

/**
 * Form for updating an existing Fault.
 * @param {{ initialData: any, onSubmit: (faultData: any) => void }} props
 */
export function UpdateFaultForm({ initialData = {}, onSubmit }) {
    const [values, setValues] = useState({
        tool: '',
        code: '',
        description: '',
        photos: '',
        status: 'open',
        closedAt: '',
    });

    useEffect(() => {
        if (initialData) {
            setValues({
                tool: initialData.tool || '',
                code: initialData.code || '',
                description: initialData.description || '',
                photos: Array.isArray(initialData.photos)
                    ? initialData.photos.join(', ')
                    : '',
                status: initialData.status || 'open',
                closedAt: initialData.closedAt
                    ? initialData.closedAt.slice(0, 10)
                    : '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.code.trim() || !values.description.trim()) return;

        onSubmit({
            tool: values.tool,
            code: values.code,
            description: values.description,
            photos: values.photos
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            status: values.status,
            closedAt:
                values.status === 'closed' && values.closedAt
                    ? new Date(values.closedAt)
                    : undefined,
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
            <FaultFormFields values={values} onChange={handleChange} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Update Fault
                </Button>
            </Box>
        </Box>
    );
}
