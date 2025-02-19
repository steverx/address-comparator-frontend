const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Startup logging
console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Check build directory
const buildPath = path.join(__dirname, 'build');
console.log('Checking build path:', buildPath);

try {
    const stats = fs.statSync(buildPath);
    console.log('Build directory exists:', stats.isDirectory());
    const files = fs.readdirSync(buildPath);
    console.log('Build directory contents:', files);
} catch (err) {
    console.error('Error accessing build directory:', err);
    process.exit(1);
}

// Serve static files
app.use(express.static(buildPath));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Handle React routing
app.get('/*', function (req, res) {
    console.log('Serving index.html for path:', req.path);
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

const port = process.env.PORT || 3000;

// Start server
app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
    console.log(`Server is running on port ${port}`);
    console.log('Server is ready to accept connections');
});