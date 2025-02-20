const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced startup logging
console.log('Starting server with configuration:', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    workingDirectory: process.cwd(),
    buildExists: fs.existsSync(path.join(__dirname, 'build')),
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: PORT,
        cwd: process.cwd(),
        files: fs.readdirSync(path.join(__dirname, 'build'))
    });
});

// Static files
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});