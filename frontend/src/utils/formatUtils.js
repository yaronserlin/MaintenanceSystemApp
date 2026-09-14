/**
 * Formats a user name so that the first letter of each part (first name,
 * last name, middle names, hyphenated names) is always capitalized.
 *
 * Examples:
 *   "john doe" -> "John Doe"
 *   "JOHN DOE" -> "John Doe"
 *   "mary-jane watson" -> "Mary-Jane Watson"
 *   "alice" -> "Alice"
 *
 * @param {string} [name] - Raw user name
 * @returns {string} Capitalized formatted name
 */
export function formatUserName(name) {
    if (!name || typeof name !== 'string') return '';
    const trimmed = name.trim();
    if (!trimmed) return '';

    return trimmed
        .split(/\s+/)
        .map(word => {
            return word
                .split('-')
                .map(part => {
                    if (!part) return '';
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                })
                .join('-');
        })
        .join(' ');
}

/**
 * Extracts initials from a user's name (e.g., "John Doe" -> "JD").
 * Returns "U" if name is missing or invalid.
 *
 * @param {string} [name] - User name
 * @returns {string} 1-2 uppercase letters representing initials
 */
export function getUserInitials(name) {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase() || 'U';
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
