// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        // after logout, send the user to /login (or wherever)
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    return <LoadingComponent />;
}
