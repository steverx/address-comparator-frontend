const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Logging for startup
console.log('Starting server initialization...');
console.log('Current directory:', __dirname);
console.log('Directory contents:', fs.readdirSync(__dirname));

// Check build directory
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
    console.log('Build directory found:', buildPath);
    console.log('Build contents:', fs.readdirSync(buildPath));
} else {
    console.error('Build directory not found!');
    process.exit(1);
}

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

// Static file serving
app.get('*.js', (req, res, next) => {
    res.set('Content-Type', 'application/javascript');
    next();
});

app.get('*.css', (req, res, next) => {
    res.set('Content-Type', 'text/css');
    next();
});

// Serve static files with explicit content types
app.use(express.static(buildPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            res.setHeader('Cache-Control', 'max-age=3600');
        }
    }
}));

// Serve index.html for all other routes
app.get('*', (req, res) => {
    try {
        const indexPath = path.join(buildPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('Serving index.html');
            res.sendFile(indexPath);
        } else {
            console.error('index.html not found!');
            res.status(404).send('index.html not found');
        }
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Server error');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

// Start server with explicit error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Server ready to accept connections');
});