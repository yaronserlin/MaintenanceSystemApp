// src/components/Form/Input.jsx
import React, { forwardRef, useState } from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
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
const Password = forwardRef(({ label = 'Password', ...props }, ref) => {
    const [show, setShow] = useState(false);
    const handleToggle = () => setShow((prev) => !prev);
    
        return (
            <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor={props.id || props.name}>{label}</InputLabel>
                <OutlinedInput
                    id={props.id || props.name}
                    inputRef={ref}
                    type={show ? 'text' : 'password'}
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
            </FormControl>
        );
});
Password.displayName = 'PasswordInput';

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
    // Number: createInputComponent('number', 'Number'),
    // Url:    createInputComponent('url',    'URL'),
};

export default Input;
