import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // On mount, check if authenticated session exists via httpOnly cookie
    useEffect(() => {
        let isMounted = true;
        apiClient.get('/auth/me')
            .then(res => {
                if (isMounted) {
                    setUser(res.data);
                    setUserId(res.data.id || res.data._id);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUser(null);
                    setUserId(null);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await apiClient.post('/auth/login', { email, password });
            setUser(data.user);
            setUserId(data.user.id || data.user._id);
            navigate('/dashboard');
            return data.user;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Login failed, please check your credentials');
            } else {
                throw new Error('Login failed, please try again later');
            }
        } finally {
            setLoading(false);
        }
    };

    // Company self-service signup function
    const signup = async ({ companyName, name, email, password }) => {
        setLoading(true);
        try {
            const { data } = await apiClient.post('/auth/register', {
                companyName,
                name,
                email,
                password,
            });
            setUser(data.user);
            setUserId(data.user.id || data.user._id);
            navigate('/dashboard');
            return data.user;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Signup failed, please try again');
            } else {
                throw new Error('Signup failed, please try again later');
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setUserId(null);
            navigate('/login');
        }
    };

    // Upload avatar function
    const updateAvatar = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const { data } = await apiClient.post('/auth/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUser(data);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, setUser, userId, loading, login, signup, logout, updateAvatar }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
