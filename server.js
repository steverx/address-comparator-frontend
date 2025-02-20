const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Request logging with enhanced details
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Request:`, {
        method: req.method,
        path: req.path,
        host: req.get('host'),
        forwarded: req.get('x-forwarded-for'),
        protocol: req.protocol
    });
    next();
});

// Health check endpoint with connection info
app.get('/health', (req, res) => {
    const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: PORT,
            PUBLIC_URL: process.env.RAILWAY_PUBLIC_DOMAIN
        },
        request: {
            host: req.get('host'),
            protocol: req.protocol,
            originalUrl: req.originalUrl
        }
    };
    console.log('Health check:', healthInfo);
    res.status(200).json(healthInfo);
});

// Static file serving with explicit options
app.use(express.static(path.join(__dirname, 'build'), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// SPA fallback with error handling
app.get('*', (req, res, next) => {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    res.sendFile(indexPath, err => {
        if (err) {
            console.error('Error serving index.html:', err);
            next(err);
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server with enhanced error reporting
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('Server started:', {
        port: PORT,
        env: process.env.NODE_ENV,
        publicUrl: process.env.RAILWAY_PUBLIC_DOMAIN,
        time: new Date().toISOString()
    });
}).on('error', (error) => {
    console.error('Server start failed:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});