// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

import Dashboard from './pages/Dashboard';
import ToolPage from './pages/ToolPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Logout from './pages/Logout';
import { Container } from '@mui/material';
import ToolsPage from './pages/ToolsPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './components/RequireAdmin';
import Navbar from './components/Navbar';



export default function AppRoutes() {
    const pages = ['Tools'];
    const settings = ['Profile', 'Account', 'Logout'];


    return (
        <AuthProvider>
            <Navbar pages={pages} settings={settings} />
            <Container sx={{ mt: 4, mb: 4 }}>
                <Routes>
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/tools" replace />} />

                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes */}
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
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute>
                                <AccountPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <RequireAdmin>
                                    <AdminDashboard />
                                </RequireAdmin>
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
