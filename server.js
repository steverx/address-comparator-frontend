const express = require('express');
const path = require('path');
const app = express();

console.log('Starting server with environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
});

// Serve static files from the React build directory
app.use(express.static('build'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// All other routes should serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});