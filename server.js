const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve favicon directly from memory
let faviconBuffer;
try {
    faviconBuffer = fs.readFileSync(path.join(__dirname, 'build', 'favicon.ico'));
} catch (err) {
    console.warn('Favicon not found, will serve empty response');
}

// Quick favicon response
app.get('/favicon.ico', (req, res) => {
    if (faviconBuffer) {
        res.set('Content-Type', 'image/x-icon');
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(faviconBuffer);
    }
    res.status(204).end();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Main app route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});