// components/UserForm.jsx
import React, { useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem } from '@mui/material';
import useForm from '../../../hooks/useForm';


function UserForm({
    initialValues,
    onSubmit,
    submitLabel = 'Submit',
    validate,
}) {
    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
        setValues,
    } = useForm({
        initialValues,
        validate,
        onSubmit: (vals) => {
            onSubmit(vals);
            // if it’s a “create” scenario, clear the form after
            if (submitLabel.toLowerCase() === 'create') {
                resetForm();
            }
        },
    });

    // Sync in updates if initialValues ever change
    useEffect(() => {
        setValues(initialValues);
    }, [initialValues, setValues]);

    return (
        <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
            <UserFormFields values={values} onChange={handleChange} />

            {/* Example of per-field error display */}
            {Object.entries(errors).map(([field, msg]) => (
                <Typography key={field} color="error" variant="caption">
                    {msg}
                </Typography>
            ))}

            <Box mt={3}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {submitLabel}
                </Button>
            </Box>
        </Box>
    );
}

// components/CreateUserForm.jsx
// import React from 'react';
// import UserForm from './UserForm';

const CREATE_INITIAL = {
    name: '',
    email: '',
    password: '',
    role: 'operator',
};

const validateUser = (vals) => {
    const errs = {};
    if (!vals.name.trim()) errs.name = 'Name is required';
    if (vals.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email))
        errs.email = 'Invalid email';
    // add more rules here if needed…
    return errs;
};

export function CreateUserForm({ onSubmit }) {
    return (
        <UserForm
            initialValues={CREATE_INITIAL}
            onSubmit={onSubmit}
            submitLabel="Create"
            validate={validateUser}
        />
    );
}



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

// // Create User Form Component
// export function CreateUserForm({ onSubmit }) {
//     const [values, setValues] = useState({
//         name: '',
//         email: '',
//         password: '',
//         role: 'operator', // Default role

//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         console.log(`Field changed: ${name} = ${value}`);

//         setValues((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!values.name.trim()) return;
//         onSubmit(values);
//     };

//     return (
//         <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>

//             <UserFormFields values={values} onChange={handleChange} />
//             <Box mt={3}>
//                 <Button type="submit" variant="contained">
//                     Create
//                 </Button>
//             </Box>
//         </Box>
//     );
// }

// // Update User Form Component
// export function UpdateUserForm({ initialData = {}, onSubmit }) {
//     const [values, setValues] = useState({
//         name: '',
//         email: '',
//         role: 'operator', // Default role

//     });

//     useEffect(() => {
//         if (initialData) {
//             setValues({
//                 name: initialData.name || '',
//                 email: initialData.email || '',
//                 role: initialData.role || '',
//             });
//         }
//     }, [initialData]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setValues((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!values.name.trim()) return;
//         onSubmit(values);
//     };

//     return (
//         <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
//             <UserFormFields values={values} onChange={handleChange} />
//             <Box mt={3}>
//                 <Button type="submit" variant="contained">
//                     Update
//                 </Button>
//             </Box>
//         </Box>
//     );
// }
