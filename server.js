const express = require('express');
const path = require('path');
const app = express();

// Log startup information
console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Verify build directory exists
const buildPath = path.join(__dirname, 'build');
try {
    require('fs').accessSync(buildPath);
    console.log('Build directory found at:', buildPath);
} catch (err) {
    console.error('Build directory not found! Error:', err);
    console.error('Please ensure npm run build has been executed');
}

// Serve static files
app.use(express.static(buildPath));

// Handle React routing
app.get('/*', function (req, res) {
    console.log('Handling request for:', req.path);
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

const port = process.env.PORT || 3000;

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Server is ready to accept connections`);
});