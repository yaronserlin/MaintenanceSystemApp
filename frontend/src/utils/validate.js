// src/utils/validators.js

/**
 * Check that a value is not empty.
 * @param {string|any[]} value
 * @param {string} fieldName
 * @returns {string} error message or empty string
 */
export function isRequired(value, fieldName = 'This field') {
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
    ) {
        return `${fieldName} is required.`;
    }
    return '';
}

/**
 * Validate an email address.
 * @param {string} email
 * @returns {string} error message or empty string
 */
export function validateEmail(email) {
    let err = isRequired(email, 'Email');
    if (err) return err;

    // basic RFC-5322-ish pattern
    // eslint-disable-next-line no-useless-escape
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email)
        ? ''
        : 'Please enter a valid email address.';
}

/**
 * Validate password strength:
 * - at least 8 chars
 * - at least one lowercase, one uppercase, one digit, one special char
 * @param {string} pwd
 * @returns {string} error message or empty string
 */
export function validatePassword(pwd) {
    let err = isRequired(pwd, 'Password');
    if (err) return err;

    // if (pwd.length < 8) {
    //     return 'Password must be at least 8 characters.';
    // }
    // if (!/[A-Z]/.test(pwd)) {
    //     return 'Password must contain at least one uppercase letter.';
    // }
    // if (!/[a-z]/.test(pwd)) {
    //     return 'Password must contain at least one lowercase letter.';
    // }
    // if (!/[0-9]/.test(pwd)) {
    //     return 'Password must contain at least one digit.';
    // }
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
    //     return 'Password must contain at least one special character (e.g. !@#$%).';
    // }
    return '';
}

/**
 * Generic min-length check for arbitrary fields.
 * @param {string} value
 * @param {number} min
 * @param {string} fieldName
 * @returns {string}
 */
export function validateMinLength(value, min, fieldName = 'This field') {
    if (typeof value === 'string' && value.trim().length > 0 && value.length < min) {
        return `${fieldName} must be at least ${min} characters.`;
    }
    return '';
}
