const express = require('express');
const path = require('path');
const app = express();

// Log environment variables at startup
console.log('Starting server with config:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.cwd()
});

// Basic middleware for logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Health check must return quickly
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// All routes serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Server error');
});

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});