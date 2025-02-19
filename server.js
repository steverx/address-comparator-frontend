const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Trust proxy - important for Railway
app.set('trust proxy', true);

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Basic request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Verify build path
const buildPath = path.join(__dirname, 'build');
console.log('Build path:', buildPath);
console.log('Build directory exists:', fs.existsSync(buildPath));

// Serve static files with caching headers
app.use(express.static(buildPath, {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Handle React routing
app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application not found');
    }
});

const port = process.env.PORT || 3000;

// Start server with error handling
const server = app.listen(port, '0.0.0.0', (error) => {
    if (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
    console.log(`Server running on port ${port}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
    });
});