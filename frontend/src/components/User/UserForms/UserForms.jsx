import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem } from '@mui/material';

// Generic form fields component (used by both create and update forms)
function UserFormFields({ values, onChange }) {
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
                label="Email"
                name="email"
                value={values.email}
                onChange={onChange}
            />
            <TextField
                label="Password"
                name="password"
                type='password'
                value={values.password}
                onChange={onChange}
            />
            <Select
                labelId="role"
                name='role'
                id="role"
                value={values.role}
                label="role"
                onChange={onChange}
            >
                <MenuItem value={'admin'}>Admin</MenuItem>
                <MenuItem value={'operator'}>Operator</MenuItem>
                <MenuItem value={'mechanic'}>Mechanic</MenuItem>
            </Select>


        </Box>
    );
}

// Create User Form Component
export function CreateUserForm({ onSubmit }) {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        role: 'operator', // Default role

    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field changed: ${name} = ${value}`);

        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        onSubmit(values);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>

            <UserFormFields values={values} onChange={handleChange} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Create
                </Button>
            </Box>
        </Box>
    );
}

// Update User Form Component
export function UpdateUserForm({ initialData = {}, onSubmit }) {
    const [values, setValues] = useState({
        name: '',
        email: '',
        role: 'operator', // Default role

    });

    useEffect(() => {
        if (initialData) {
            setValues({
                name: initialData.name || '',
                email: initialData.email || '',
                role: initialData.role || '',
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
            <UserFormFields values={values} onChange={handleChange} />
            <Box mt={3}>
                <Button type="submit" variant="contained">
                    Update
                </Button>
            </Box>
        </Box>
    );
}
