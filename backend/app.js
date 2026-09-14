// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { verifyToken } = require('./middleware/authMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');
const faultRoutes = require('./routes/faultRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const partRoutes = require('./routes/partRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect Database if not already connected (e.g., in testing)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS locked to configured frontend origin
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
        if (!origin || origin === allowedOrigin || origin === 'http://localhost:5173' || origin === 'http://localhost:4173') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploads - protected by authentication (Finding #8)
app.use('/uploads', verifyToken, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (Phase 5)
app.get('/api/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        database: isDbConnected ? 'connected' : 'disconnected',
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/faults', faultRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler (Finding #7 Fix: log error, proper 500 response, no swallowed errors)
app.use((err, req, res, next) => {
    // Syntax error from bad JSON payload
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Mongoose cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: err.message });
    }

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'CORS forbidden' });
    }

    // Server-side logging of unexpected errors
    console.error('Unhandled server error:', err);

    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        message: isProduction ? 'Server error' : (err.message || 'Server error'),
    });
});

if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;