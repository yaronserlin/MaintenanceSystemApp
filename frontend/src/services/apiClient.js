// src/services/apiClient.js
import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
    // baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
    baseURL: 'http://localhost:4000/api',
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
