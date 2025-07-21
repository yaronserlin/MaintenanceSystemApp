// src/services/apiClient.js
import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Set or remove the Authorization header on the axios instance
 * @param {string|null} token - JWT token; if null, header is removed
 */
apiClient.setToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

export default apiClient;
