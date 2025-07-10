// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        // after logout, send the user to /login (or wherever)
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    return null; // or a spinner if you want a flash of UI
}
