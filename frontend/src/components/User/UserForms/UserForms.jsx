import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, MenuItem, Alert } from '@mui/material';

import useForm from '../../../hooks/useForm';
import Input from '../../From/Input';
import {
    validateName,
    validateEmail,
    validatePassword,
    validateRole,
} from '../../../utils/validate';

/**
 * @param {{ name: string; email: string; password?: string; role: string }} initialValues
 * @param {(vals: object) => Promise} onSubmit
 * @param {string} submitLabel
 */
function UserForm({ initialValues, onSubmit, submitLabel = 'Submit' }) {
    const [serverError, setServerError] = useState('');

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
        validate: validateUser,
        onSubmit: async (vals) => {
            setServerError('');
            try {
                await onSubmit(vals);
                if (submitLabel.toLowerCase() === 'create') {
                    resetForm();
                }
            } catch (err) {
                setServerError(err.message || 'Submission failed');
            }
        },
    });

    // keep local form in sync if parent changes initialValues
    useEffect(() => {
        setValues(initialValues);
    }, [initialValues, setValues]);

    // clear server error on any field change
    const handleFieldChange = useCallback(
        (e) => {
            if (serverError) setServerError('');
            handleChange(e);
        },
        [handleChange, serverError]
    );

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <Input.Text
                name="name"
                label="Name"
                value={values.name}
                onChange={handleFieldChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
            />

            <Input.Email
                name="email"
                label="Email"
                value={values.email}
                onChange={handleFieldChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                required
            />

            <Input.Password
                name="password"
                label="Password"
                value={values.password}
                onChange={handleFieldChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
                required
            />

            <Input.Select
                name="role"
                label="Role"
                value={values.role}
                onChange={handleFieldChange}
                error={Boolean(errors.role)}
                helperText={errors.role}
                options={[
                    { value: 'operator', label: 'Operator' },
                    { value: 'mechanic', label: 'Mechanic' },
                    { value: 'admin', label: 'Admin' },
                ]}
            // helperText={errors.role}
            />
            {/* <MenuItem value="operator">Operator</MenuItem>
                <MenuItem value="mechanic">Mechanic</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
            </Input.Select> */}

            <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
            >
                {isSubmitting ? `${submitLabel}…` : submitLabel}
            </Button>
        </Box>
    );
}

/** field‐level validation for all user fields */
function validateUser(vals) {
    const errs = {};
    const nameErr = validateName(vals.name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(vals.email);
    if (emailErr) errs.email = emailErr;


    const pwdErr = validatePassword(vals.password);
    if (pwdErr) errs.password = pwdErr;

    const roleErr = validateRole(vals.role);
    if (roleErr) errs.role = roleErr;

    return errs;
}

/** Blank form for creating a new user */
export function CreateUserForm({ onSubmit }) {
    const initial = { name: '', email: '', password: '', role: 'operator' };
    return (
        <UserForm
            initialValues={initial}
            onSubmit={onSubmit}
            submitLabel="Create"
        />
    );
}

/** Pre-filled form for updating an existing user */
export function UpdateUserForm({ initialValues, onSubmit }) {
    return (
        <UserForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            submitLabel="Update"
        />
    );
}

export default UserForm;

// // components/UserForm.jsx
// import React, { useEffect } from 'react';
// import { Box, TextField, Button, Typography, Select, MenuItem } from '@mui/material';
// import useForm from '../../../hooks/useForm';


// function UserForm({
//     initialValues,
//     onSubmit,
//     submitLabel = 'Submit',
//     validate,
// }) {
//     const {
//         values,
//         errors,
//         isSubmitting,
//         handleChange,
//         handleSubmit,
//         resetForm,
//         setValues,
//     } = useForm({
//         initialValues,
//         validate,
//         onSubmit: (vals) => {
//             onSubmit(vals);
//             // if it’s a “create” scenario, clear the form after
//             if (submitLabel.toLowerCase() === 'create') {
//                 resetForm();
//             }
//         },
//     });

//     // Sync in updates if initialValues ever change
//     useEffect(() => {
//         setValues(initialValues);
//     }, [initialValues, setValues]);

//     return (
//         <Box component="form" onSubmit={handleSubmit} p={2} maxWidth={600}>
//             <UserFormFields values={values} onChange={handleChange} />

//             {/* Example of per-field error display */}
//             {Object.entries(errors).map(([field, msg]) => (
//                 <Typography key={field} color="error" variant="caption">
//                     {msg}
//                 </Typography>
//             ))}

//             <Box mt={3}>
//                 <Button type="submit" variant="contained" disabled={isSubmitting}>
//                     {submitLabel}
//                 </Button>
//             </Box>
//         </Box>
//     );
// }

// // components/CreateUserForm.jsx
// // import React from 'react';
// // import UserForm from './UserForm';

// const CREATE_INITIAL = {
//     name: '',
//     email: '',
//     password: '',
//     role: 'operator',
// };

// const validateUser = (vals) => {
//     const errs = {};
//     if (!vals.name.trim()) errs.name = 'Name is required';
//     if (vals.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email))
//         errs.email = 'Invalid email';
//     // add more rules here if needed…
//     return errs;
// };

// export function CreateUserForm({ onSubmit }) {
//     return (
//         <UserForm
//             initialValues={CREATE_INITIAL}
//             onSubmit={onSubmit}
//             submitLabel="Create"
//             validate={validateUser}
//         />
//     );
// }



// // Generic form fields component (used by both create and update forms)
// function UserFormFields({ values, onChange }) {
//     return (
//         <Box display="flex" flexDirection="column" gap={2}>
//             <TextField
//                 label="Name"
//                 name="name"
//                 required
//                 value={values.name}
//                 onChange={onChange}
//             />
//             <TextField
//                 label="Email"
//                 name="email"
//                 value={values.email}
//                 onChange={onChange}
//             />
//             <TextField
//                 label="Password"
//                 name="password"
//                 type='password'
//                 value={values.password}
//                 onChange={onChange}
//             />
//             <Select
//                 labelId="role"
//                 name='role'
//                 id="role"
//                 value={values.role}
//                 label="role"
//                 onChange={onChange}
//             >
//                 <MenuItem value={'admin'}>Admin</MenuItem>
//                 <MenuItem value={'operator'}>Operator</MenuItem>
//                 <MenuItem value={'mechanic'}>Mechanic</MenuItem>
//             </Select>


//         </Box>
//     );
// }
