import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Chip } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
};

export default function FaultModal({ fault, handleClose, open }) {
    if (!fault) return null;

    return (
        <div>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <Typography id="modal-title" variant="h6" component="h2">
                            {fault.tool?.name ?? 'Unknown Tool'} - Code: {fault.code || 'N/A'}
                            {fault.status && (
                                <Chip
                                    label={fault.status.toUpperCase()}
                                    color={fault.status === 'open' ? 'error' : 'success'}
                                    sx={{ ml: 2 }}
                                />
                            )}
                        </Typography>
                        <Typography id="modal-description" sx={{ mt: 2 }}>
                            {fault.description}
                        </Typography>
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            Created at {fault.createdAt ? new Date(fault.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 3, textAlign: 'right' }}>
                            <Button variant="outlined" onClick={handleClose}>
                                Close
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
}
