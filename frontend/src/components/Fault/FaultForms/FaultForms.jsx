import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Chip } from '@mui/material';
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
function FaultFormFields({ values, onChange, onRemoveFile, tools = [] }) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {/* Equipment selector */}
            <TextField
                label="Equipment"
                name="tool"
                select
                SelectProps={{ native: true }}
                value={values.tool}
                onChange={onChange}
            >
                <option value="" disabled>
                    Select equipment
                </option>
                {tools.map(tool => (
                    <option key={tool._id} value={tool._id}>
                        {tool.name} {tool.localSerialNumber ? `(${tool.localSerialNumber})` : ''}
                    </option>
                ))}
            </TextField>

            {/* Fault code */}
            <TextField
                label="Fault Code"
                name="code"
                required
                value={values.code}
                onChange={onChange}
                placeholder="e.g. HYD-01 or ENG-104"
            />

            {/* Engine Hours */}
            <TextField
                label="Engine Hours (optional)"
                name="engineHours"
                type="number"
                inputProps={{ min: 0, step: 'any' }}
                value={values.engineHours}
                onChange={onChange}
                helperText="Current operating hours of the equipment"
            />

            {/* Detailed description */}
            <TextField
                label="Description"
                name="description"
                required
                multiline
                rows={3}
                value={values.description}
                onChange={onChange}
            />

            {/* Photo Upload via File Picker */}
            <Box>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                >
                    {values.files && values.files.length > 0
                        ? `Add More Photos (${values.files.length} selected)`
                        : 'Select Photos to Upload'}
                    <VisuallyHiddenInput
                        type="file"
                        id="photosFiles"
                        name="photosFiles"
                        accept="image/*"
                        onChange={onChange}
                        multiple
                    />
                </Button>

                {values.files && values.files.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                        {values.files.map((file, idx) => (
                            <Chip
                                key={idx}
                                label={file.name}
                                onDelete={() => onRemoveFile?.(idx)}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                )}
            </Box>

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
export function CreateFaultForm({ onSubmit, toolId, equipmentId, formId = 'create-fault-form', hideSubmitButton = false }) {
    const activeEquipmentId = equipmentId || toolId;
    const { tools = [] } = useTool();
    const [values, setValues] = useState({
        tool: activeEquipmentId || (tools.length > 0 ? tools[0]._id : ''),
        code: '',
        engineHours: '',
        description: '',
        files: [],
        status: 'open',
        closedAt: '',
    });

    useEffect(() => {
        if (!values.tool && tools.length > 0) {
            setValues(prev => ({ ...prev, tool: activeEquipmentId || tools[0]._id }));
        }
    }, [tools, activeEquipmentId, values.tool]);

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            const selectedFiles = Array.from(e.target.files || []);
            setValues(prev => ({
                ...prev,
                files: [...prev.files, ...selectedFiles],
            }));
        } else {
            const { name, value } = e.target;
            setValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        setValues(prev => ({
            ...prev,
            files: prev.files.filter((_, idx) => idx !== indexToRemove),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.description.trim()) return;

        onSubmit({
            tool: values.tool,
            code: values.code,
            engineHours: values.engineHours ? parseFloat(values.engineHours) : undefined,
            description: values.description,
            files: values.files,
            status: values.status,
            closedAt: values.status === 'closed' && values.closedAt
                ? new Date(values.closedAt)
                : undefined,
        });
    };

    return (
        <Box component="form" id={formId} onSubmit={handleSubmit} p={1} maxWidth={600}>
            <FaultFormFields
                values={values}
                onChange={handleChange}
                onRemoveFile={handleRemoveFile}
                tools={tools}
            />
            {!hideSubmitButton && (
                <Box mt={3}>
                    <Button type="submit" variant="contained">
                        Create
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default CreateFaultForm;
