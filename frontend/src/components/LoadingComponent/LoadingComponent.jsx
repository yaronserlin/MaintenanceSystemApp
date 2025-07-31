import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function LoadingComponent() {
    return (
        <Box
        // position="absolute"
        // top="50%"
        // left="50%"
        // sx={{ transform: 'translate(-50%, -50%)' }}
        // zIndex={1300}
        >
            <CircularProgress />
        </Box>
    );
}
