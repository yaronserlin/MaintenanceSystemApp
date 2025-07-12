import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Typography } from '@mui/material';


export default function LoadingComponent() {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress />

            </div>
        </div>
    );
}

