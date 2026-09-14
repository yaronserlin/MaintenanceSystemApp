// src/utils/mediaUtils.js

/**
 * Resolves a media file path (e.g. /uploads/photo-123.jpg) to a fully-qualified URL.
 * Handles both relative /uploads paths and full HTTP/HTTPS URLs.
 *
 * @param {string} path - The image or document path.
 * @returns {string} The resolved URL for rendering or downloading.
 */
export function getMediaUrl(path) {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
        const origin = apiUrl.replace(/\/api\/?$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${origin}${cleanPath}`;
    }

    return path;
}
