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
const equipmentRoutes = require('./routes/equipmentRoutes');
const toolRoutes = require('./routes/toolRoutes');
const faultRoutes = require('./routes/faultRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const partRoutes = require('./routes/partRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logger = require('./utils/logger');

const app = express();

// Connect Database if not already connected (e.g., in testing)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'frame-ancestors': ["'self'", 'http://localhost:5173', 'http://localhost:4173', process.env.FRONTEND_URL].filter(Boolean),
        },
    },
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

// HTTP Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Uploads - served statically so <img> and PDF viewers can load media without CORS issues
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/equipment', equipmentRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/faults', faultRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler (Finding #7 Fix: log error, proper 500 response, no swallowed errors)
app.use((err, req, res, next) => {
    // Syntax error from bad JSON payload
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        logger.warn(`JSON syntax error: ${err.message}`);
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        logger.warn(`Validation error: ${messages.join(', ')}`);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Mongoose cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
        logger.warn(`Cast error on field ${err.path}: ${err.value}`);
        return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        logger.warn(`Multer upload error: ${err.message}`);
        return res.status(400).json({ message: err.message });
    }

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        logger.warn(`CORS blocked request from origin: ${req.headers.origin}`);
        return res.status(403).json({ message: 'CORS forbidden' });
    }

    // Server-side logging of unexpected errors
    logger.error('Unhandled server error:', err);

    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        message: isProduction ? 'Server error' : (err.message || 'Server error'),
    });
});

if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;