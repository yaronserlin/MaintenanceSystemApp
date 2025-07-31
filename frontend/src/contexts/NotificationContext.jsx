// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useMemo } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Create notification context
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [messageInfo, setMessageInfo] = useState({ message: '', severity: 'info' });

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    // Memoized notify API to ensure stable identity
    const notify = useMemo(() => ({
        success: (msg) => { setMessageInfo({ message: msg, severity: 'success' }); setOpen(true); },
        error: (msg) => { setMessageInfo({ message: msg, severity: 'error' }); setOpen(true); },
        info: (msg) => { setMessageInfo({ message: msg, severity: 'info' }); setOpen(true); },
        warning: (msg) => { setMessageInfo({ message: msg, severity: 'warning' }); setOpen(true); },
    }), []);

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Alert onClose={handleClose} severity={messageInfo.severity} variant="filled" sx={{ width: '100%' }}>
                    {messageInfo.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}

export function useNotify() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotify must be used within NotificationProvider');
    return context;
}