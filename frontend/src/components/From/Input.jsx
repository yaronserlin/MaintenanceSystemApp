// src/components/Form/Input.jsx
import React, { forwardRef, useState } from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    Typography,
    Select,
    MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Factory to create a MUI TextField wrapper with a fixed `type` and default label.
 * Uses forwardRef so you can get a ref to the underlying input if you need it.
 *
 * @param {string} type – the HTML input type (e.g. "email", "password", etc.)
 * @param {string} defaultLabel – label to show if none is passed via props
 */
function createInputComponent(type, defaultLabel) {
    const Component = forwardRef(({ label = defaultLabel, ...props }, ref) => (
        <TextField
            // fullWidth / variant / size are just examples—tweak to suit your form’s design system
            fullWidth
            variant={props.variant || "outlined"}
            label={label}
            type={type}
            inputRef={ref}
            {...props}
        />
    ));
    Component.displayName = `${defaultLabel.replace(/\s+/g, '')}Input`;
    return Component;
}

/**
 * A password field with visibility toggle built in.
 */
const Password = forwardRef(({ label = 'Password', helperText, error, required, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const handleToggle = () => setShow((prev) => !prev);

    return (
        <FormControl fullWidth variant="outlined" required={required} error={!!error}>
            <InputLabel htmlFor={props.id || props.name}>{label}</InputLabel>
            <OutlinedInput
                id={props.id || props.name}
                inputRef={ref}
                type={show ? 'text' : 'password'}
                error={!!error}
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
            {/* If you want to show helper text or error messages, you can pass them via props */}
            {error && (

                <Typography variant="caption" color="error">
                    {helperText}
                </Typography>
            )}
        </FormControl>
    );
});
Password.displayName = 'PasswordInput';

/**
 * A select input component with options.
 * Uses MUI's Select and MenuItem components.
 * You can pass an array of options as props.
 * Example:
 * ```jsx
 * <SelectInput
 *     label="Choose an option"
 *    options={[
 *        { value: 'option1', label: 'Option 1' },
 *       { value: 'option2', label: 'Option 2' },
 *   ]}
 *   onChange={handleChange}
 *  value={selectedValue}
 * />
 * 
 */
const select = forwardRef(({ label, options, helperText, error, ...props }, ref) => (
    <FormControl fullWidth variant="outlined">
        <InputLabel id={props.id || props.name}>{label}</InputLabel>
        <Select
            labelId={props.id || props.name}
            inputRef={ref}
            label={label}
            error={!!error}
            {...props}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
        {error && (

            <Typography variant="caption" color="error">
                {helperText}
            </Typography>
        )}
    </FormControl>
));
select.displayName = 'SelectInput'; // Uncomment if you want to set a display name

// Create each specialized input
const Email = createInputComponent('email', 'Email');
const Text = createInputComponent('text', 'Text');
const Number = createInputComponent('number', 'Number');
const Url = createInputComponent('url', 'URL');
// …add more as needed, e.g. Number, Url, Search, etc.

const Input = {
    Email,
    Password,
    Text,
    Number,
    Url,
    Select: select,
    // Number: createInputComponent('number', 'Number'),
    // Url:    createInputComponent('url',    'URL'),
};

export default Input;
