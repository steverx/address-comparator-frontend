const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Debug logging
const debug = require('debug')('app:server');
debug('Starting server...');

// Request logging
app.use((req, res, next) => {
    debug(`${req.method} ${req.url}`);
    next();
});

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Static files with aggressive caching
app.use(express.static(path.join(__dirname, 'build'), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// Health check with detailed response
app.get('/health', (req, res) => {
    debug('Health check requested');
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: process.uptime()
    });
});

// React app serving
app.get('*', (req, res, next) => {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    res.sendFile(indexPath, err => {
        if (err) {
            debug('Error serving index.html:', err);
            next(err);
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    debug('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server with proper error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    debug(`Server running on port ${PORT}`);
}).on('error', (err) => {
    debug('Server failed to start:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    debug('SIGTERM received');
    server.close(() => {
        debug('Server closed');
        process.exit(0);
    });
});