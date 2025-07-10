// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

// Create the Auth context
const AuthContext = createContext();

// Provider component to wrap around the app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // On mount, restore user from token if present
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            apiClient.setToken(token);
            apiClient.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    apiClient.setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        // const data = { token: "12345", user: { email, name: "Yaron Serlin", avatarUrl: '' } }
        localStorage.setItem('token', data.token);
        apiClient.setToken(data.token);
        setUser(data.user);
        navigate('/dashboard');
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        apiClient.setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
