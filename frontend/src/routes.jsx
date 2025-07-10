// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ToolPage from './pages/ToolPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Tool-specific pages, supports nested tabs inside ToolPage */}
            <Route path="/tools/:toolId/*" element={<ToolPage />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}