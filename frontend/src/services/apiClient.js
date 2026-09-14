// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Initialize token from localStorage if present
try {
    const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
} catch (e) {
    // Ignore in non-browser environments
}

// Token helper: updates Authorization header and localStorage
apiClient.setToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try { localStorage.setItem('token', token); } catch (e) {}
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
        try { localStorage.removeItem('token'); } catch (e) {}
    }
};

// Global 401 response interceptor (Finding #19)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            const url = error.config?.url || '';
            const isAuthRoute =
                url.includes('/auth/login') ||
                url.includes('/auth/register') ||
                url.includes('/auth/me');

            if (!isAuthRoute && currentPath !== '/login') {
                apiClient.setToken(null);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
