import React, { useState } from 'react';
import {
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import Input from '../From/Input';
import {
    validateEmail,
    validatePassword,
} from '../../utils/validate';

/**
 * LoginForm component handles user authentication by capturing email and password,
 * performing client-side validation, displaying both field-level and server-side errors,
 * and invoking the AuthContext's login method.
 *
 * @component
 * @example
 * return <LoginForm />;
 */
export default function LoginForm() {
    // Extract login function and loading state from authentication context
    const { login, loading } = useAuth();
    // Local state to hold any server-side error message
    const [serverError, setServerError] = useState('');

    // Initialize custom form hook with validation and submit logic
    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
    } = useForm({
        initialValues: { email: '', password: '' },
        validate: (vals) => validateLogin(vals),
        onSubmit: (vals) => submitForm(vals),
    });

    /**
     * Validates login form values for email and password.
     * Utilizes utility validators for format and strength checks.
     *
     * @param {{ email: string, password: string }} vals - Current form values.
     * @returns {{ email?: string, password?: string }} Field-level error messages.
     */
    function validateLogin(vals) {
        const fieldErrors = {};
        // Check email is present and correctly formatted
        const emailErr = validateEmail(vals.email);
        if (emailErr) fieldErrors.email = emailErr;
        // Check password is present and meets strength requirements
        const pwdErr = validatePassword(vals.password);
        if (pwdErr) fieldErrors.password = pwdErr;
        return fieldErrors;
    }

    /**
     * Attempts user authentication. On success, resets the form;
     * on failure, captures and displays server-provided error message.
     *
     * @param {{ email: string, password: string }} vals - Submitted credentials.
     * @async
     */
    async function submitForm(vals) {
        // Clear any previous server error
        setServerError('');
        try {
            // Perform login via context, may throw on failure
            await login(vals.email, vals.password);
            // Reset form fields after successful login
            resetForm();
        } catch (err) {
            // Display server-side error to the user
            setServerError(err.message || 'Login failed');
        }
    }

    /**
     * Handles input field changes, clearing server errors on first keystroke
     * then delegating to the form hook's change handler.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - Change event from input.
     */
    function handleInputChange(e) {
        if (serverError) {
            setServerError('');
        }
        handleChange(e);
    }

    return (
        <>
            {/* Display server-side error above the form if present */}
            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                </Alert>
            )}

            {/* Form container using custom hook for submission and validation */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                {/* Email input with validation feedback */}
                <Input.Email
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleInputChange}
                    required
                    error={errors.email}
                    helperText={errors.email}
                />

                {/* Password input; show helper text below if validation fails */}
                <Input.Password
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleInputChange}
                    required
                    error={errors.password}
                />
                {/* {errors.password && (
                    <Typography variant="caption" color="error">
                        {errors.password}
                    </Typography>
                )} */}

                {/* Submit button disabled during validation or loading */}
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting || loading ? 'Logging in...' : 'Login'}
                </Button>
            </Box>
        </>
    );
}


// // src/components/LoginComponent/LoginForm.jsx
// import React, { useState } from 'react';
// import {
//     Button,
//     Typography,
//     Box,
//     Alert,
// } from '@mui/material';
// import { useAuth } from '../../contexts/AuthContext';
// import useForm from '../../hooks/useForm';
// import Input from '../From/Input';
// import {
//     validateEmail,
//     validatePassword,
// } from '../../utils/validate';

// export default function LoginForm() {
//     const { login, loading } = useAuth();
//     const [serverError, setServerError] = useState('');

//     const {
//         values,
//         errors,
//         isSubmitting,
//         handleChange,
//         handleSubmit,
//         resetForm,
//     } = useForm({
//         initialValues: { email: '', password: '' },
//         validate: (values) => validate(values),
//         onSubmit: (values) => submit(values),
//     });

//     const validate = (values) => {
//         const errs = {};
//         // required + email format
//         const emailError = validateEmail(values.email);
//         if (emailError) errs.email = emailError;
//         // required + strength
//         const pwdError = validatePassword(values.password);
//         if (pwdError) errs.password = pwdError;
//         return errs;
//     }

//     const submit = async (values) => {
//         setServerError('');
//         try {
//             await login(values.email, values.password);
//             resetForm();
//         } catch (err) {
//             setServerError(err.message);
//         }
//     }

//     // Wrap handleChange to also clear serverError on any new keystroke
//     const handleInputChange = (e) => {
//         if (serverError) setServerError('');
//         handleChange(e);
//     };

//     return (
//         <>

//             {/* Server-side error alert */}
//             {serverError && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     {serverError}
//                 </Alert>
//             )}

//             <Box
//                 component="form"
//                 onSubmit={handleSubmit}
//                 noValidate
//                 sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
//             >
//                 <Input.Email
//                     name="email"
//                     label="Email"
//                     value={values.email}
//                     onChange={handleInputChange}
//                     required
//                     error={!!errors.email}
//                     helperText={errors.email}
//                 />

//                 <Input.Password
//                     name="password"
//                     label="Password"
//                     value={values.password}
//                     onChange={handleInputChange}
//                     required
//                     error={!!errors.password}
//                 />
//                 {/* If you want to display password‐field validation under the input: */}
//                 {errors.password && (
//                     <Typography variant="caption" color="error">
//                         {errors.password}
//                     </Typography>
//                 )}

//                 <Button
//                     type="submit"
//                     variant="contained"
//                     fullWidth
//                     disabled={isSubmitting || loading}
//                 >
//                     {isSubmitting || loading ? 'Logging in...' : 'Login'}
//                 </Button>
//             </Box>
//         </>
//     );
// }
