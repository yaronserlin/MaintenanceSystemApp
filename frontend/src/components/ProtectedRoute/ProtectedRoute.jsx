// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingComponent from '../LoadingComponent/LoadingComponent';

/**
 * Wraps protected routes, redirecting unauthenticated users to login
 * and showing a loading state while auth is initializing.
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // You can replace this with a spinner component
        return <LoadingComponent />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
