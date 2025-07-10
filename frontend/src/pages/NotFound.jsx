import { Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate()
    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',   // stack items vertically
                justifyContent: 'center',  // horizontal centering
                alignItems: 'center',      // vertical centering
                height: '95vh',
                gap: 2,                     // spacing between lines
                p: 2,
            }}
        >
            <Typography variant="h1" component="h1" sx={{ fontWeight: "600", letterSpacing: "30px" }}>
                404
            </Typography>
            <Typography variant="h4" component="div">
                Page not found
            </Typography>
            <Typography
                variant="h4"
                component="a"
                onClick={() => navigate('/')}
                sx={{ textDecoration: 'underline', mt: 1, cursor: 'pointer' }}
            >
                Return to home
            </Typography>
        </Container>
    );
}

export default NotFound;
