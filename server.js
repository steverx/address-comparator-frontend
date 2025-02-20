const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Trust Railway's proxy
app.set('trust proxy', true);

// Add Railway-specific headers
app.use((req, res, next) => {
    res.set({
        'X-Railway-App': process.env.RAILWAY_SERVICE_NAME,
        'X-Railway-Environment': process.env.RAILWAY_ENVIRONMENT_NAME
    });
    next();
});

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Request:`, {
        method: req.method,
        path: req.path,
        host: req.get('host'),
        'x-forwarded-proto': req.get('x-forwarded-proto'),
        'x-forwarded-for': req.get('x-forwarded-for')
    });
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        proxy: {
            protocol: req.protocol,
            secure: req.secure,
            hostname: req.hostname,
            ip: req.ip
        },
        env: {
            PORT: PORT,
            NODE_ENV: process.env.NODE_ENV,
            PUBLIC_URL: process.env.RAILWAY_PUBLIC_DOMAIN
        }
    });
});

// Static files with proper headers
app.use(express.static(path.join(__dirname, 'build'), {
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
    }
}));

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server with keep-alive
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('Server started:', {
        port: PORT,
        env: process.env.NODE_ENV,
        domain: process.env.RAILWAY_PUBLIC_DOMAIN
    });
});

// Keep-alive configuration
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;