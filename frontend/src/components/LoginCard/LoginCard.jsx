
import { Card, CardContent, CardActions, TextField, Button, Typography, Box, InputAdornment, IconButton, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import Container from '@mui/material/Container';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function LoginCard() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();


    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const reset = () => {
        setEmail("")
        setPassword("")
        setShowPassword(false)
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        // Invoke callback or handle login logic here
        // console.log(email, password);
        login(email, password)
        // if (onLogin) onLogin({ email, password });

        reset();
    };

    return (
        <Container
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '95vh',
                p: 2,
            }}
        >
            <Card sx={{ minWidth: 275, maxWidth: 400, width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        Login
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <TextField
                            label="Email"
                            variant="outlined"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />
                        <FormControl sx={{}} variant="outlined">
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <OutlinedInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                                required
                                fullWidth
                            />
                        </FormControl>
                        <Button type="submit" variant="contained" fullWidth>
                            Login
                        </Button>
                    </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button size="small">Forgot Password?</Button>
                </CardActions>
            </Card>
        </Container>
    );
}

export default LoginCard;