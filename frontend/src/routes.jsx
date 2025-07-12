// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

import Dashboard from './pages/Dashboard';
import ToolPage from './pages/ToolPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Logout from './pages/Logout';
import { Container } from '@mui/material';
import ToolsPage from './pages/ToolsPage';

const pages = ['Dashboard', 'Tools'];
const settings = ['Profile', 'Account', 'Logout'];

export default function AppRoutes() {
    return (
        <AuthProvider>
            <Navbar pages={pages} settings={settings} />
            <Container sx={{ mt: 4, mb: 4 }}>
                <Routes>
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tools"
                        element={
                            <ProtectedRoute>
                                <ToolsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tools/:id/"
                        element={
                            <ProtectedRoute>
                                <ToolPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/logout"
                        element={
                            <ProtectedRoute>
                                <Logout />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Container>
        </AuthProvider>
    );
}
