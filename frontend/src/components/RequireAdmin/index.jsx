import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RequireAdmin({ children }) {
    const { user } = useAuth();

    // Debugging: Log the user object to see its properties
    // console.log('RequireAdmin user:', user);

    // If user is not logged in or not an admin, redirect accordingly
    if (!user || user.role === undefined) {
        console.warn('User is not authenticated or role is undefined');
        return <Navigate to="/login" replace />;
    }
    // If user is not an admin, redirect to dashboard
    if (user.role !== 'admin') {
        console.warn('User is not an admin, redirecting to dashboard');
        return <Navigate to="/dashboard" replace />;

    }
    // If user is an admin, render the children components
    return children;
}
