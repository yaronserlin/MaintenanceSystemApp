import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToolProvider } from './contexts/ToolContext';
import { FaultProvider } from './contexts/FaultContext';

import ProtectedRoute from './components/ProtectedRoute';
import RequireAdmin from './components/RequireAdmin';
import Navbar from './components/Navbar';
import LoadingComponent from './components/LoadingComponent/LoadingComponent';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Logout = lazy(() => import('./pages/Logout'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const EquipmentSchedulePage = lazy(() => import('./pages/EquipmentSchedulePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function RequireStaff({ children }) {
    const { user } = useAuth();
    if (user?.role === 'operator') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

export default function AppRoutes() {
    const pages = ['Dashboard', 'Equipment'];

    return (
        <NotificationProvider>
            <AuthProvider>
                <ToolProvider>
                    <FaultProvider>
                        <Navbar pages={pages} />
                        <Box component="main" sx={{ flexGrow: 1, minHeight: 'calc(100vh - 64px)' }}>
                            <Suspense fallback={<LoadingComponent />}>
                                <Routes>
                                {/* Default redirect */}
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
                                    path="/equipment"
                                    element={
                                        <ProtectedRoute>
                                            <RequireStaff>
                                                <ToolsPage />
                                            </RequireStaff>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/equipment/:id"
                                    element={
                                        <ProtectedRoute>
                                            <RequireStaff>
                                                <ToolPage />
                                            </RequireStaff>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/equipment/:id/schedules/:scheduleId"
                                    element={
                                        <ProtectedRoute>
                                            <RequireStaff>
                                                <EquipmentSchedulePage />
                                            </RequireStaff>
                                        </ProtectedRoute>
                                    }
                                />
                                {/* Backward-compatible aliases for /tools */}
                                <Route
                                    path="/tools"
                                    element={<Navigate to="/equipment" replace />}
                                />
                                <Route
                                    path="/tools/:id"
                                    element={
                                        <ProtectedRoute>
                                            <RequireStaff>
                                                <ToolPage />
                                            </RequireStaff>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/tools/:id/schedules/:scheduleId"
                                    element={
                                        <ProtectedRoute>
                                            <RequireStaff>
                                                <EquipmentSchedulePage />
                                            </RequireStaff>
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
                        </Suspense>
                    </Box>
                    </FaultProvider>
                </ToolProvider>
            </AuthProvider>
        </NotificationProvider>
    );
}
