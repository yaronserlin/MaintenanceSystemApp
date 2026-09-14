// src/components/Form/Input.jsx
import React, { forwardRef, useState } from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    FormHelperText,
    Select,
    MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Factory to create a MUI TextField wrapper with fixed type and default label.
 */
function createInputComponent(type, defaultLabel) {
    const Component = forwardRef(({ label = defaultLabel, helperText, error, ...props }, ref) => (
        <TextField
            fullWidth
            variant={props.variant || "outlined"}
            label={label}
            type={type}
            inputRef={ref}
            error={!!error}
            helperText={helperText}
            {...props}
        />
    ));
    Component.displayName = `${defaultLabel.replace(/\s+/g, '')}Input`;
    return Component;
}

/**
 * Password field with visibility toggle and accessible FormHelperText.
 */
const Password = forwardRef(({ label = 'Password', helperText, error, required, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const handleToggle = () => setShow((prev) => !prev);
    const inputId = props.id || props.name || 'password-input';
    const helperId = `${inputId}-helper-text`;

    return (
        <FormControl fullWidth variant="outlined" required={required} error={!!error}>
            <InputLabel htmlFor={inputId}>{label}</InputLabel>
            <OutlinedInput
                id={inputId}
                inputRef={ref}
                type={show ? 'text' : 'password'}
                error={!!error}
                aria-describedby={helperText ? helperId : undefined}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={show ? 'Hide password' : 'Show password'}
                            onClick={handleToggle}
                            edge="end"
                        >
                            {show ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                label={label}
                {...props}
            />
            {helperText && (
                <FormHelperText id={helperId}>
                    {helperText}
                </FormHelperText>
            )}
        </FormControl>
    );
});
Password.displayName = 'PasswordInput';

/**
 * Select input component with options and accessible helper text.
 */
const SelectInput = forwardRef(({ label, options = [], helperText, error, id, name, ...props }, ref) => {
    const labelId = `${id || name || 'select'}-label`;
    const helperId = `${id || name || 'select'}-helper-text`;

    return (
        <FormControl fullWidth variant="outlined" error={!!error}>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                inputRef={ref}
                label={label}
                error={!!error}
                aria-describedby={helperText ? helperId : undefined}
                {...props}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            {helperText && (
                <FormHelperText id={helperId}>
                    {helperText}
                </FormHelperText>
            )}
        </FormControl>
    );
});
SelectInput.displayName = 'SelectInput';

const Email = createInputComponent('email', 'Email');
const Text = createInputComponent('text', 'Text');
const NumberInput = createInputComponent('number', 'Number');
const Url = createInputComponent('url', 'URL');

const Input = {
    Email,
    Password,
    Text,
    Number: NumberInput,
    Url,
    Select: SelectInput,
};

export default Input;
