const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Server Info:`);
    console.log(`- Port: ${PORT}`);
    console.log(`- Request: ${req.method} ${req.path}`);
    console.log(`- Headers: ${JSON.stringify(req.headers, null, 2)}`);
    next();
});

// Root path handler with enhanced logging
app.get('/', (req, res) => {
    console.log('[ROOT PATH] Serving index.html');
    const indexPath = path.join(__dirname, 'build', 'index.html');
    
    // Verify file exists before sending
    if (!fs.existsSync(indexPath)) {
        console.error(`[ERROR] index.html not found at ${indexPath}`);
        return res.status(500).send('Application files not found');
    }
    
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('[ERROR] Failed to serve index.html:', err);
            res.status(500).send('Error loading application');
        }
    });
});

// Start server with enhanced logging
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] Server started:`);
    console.log(`- Port: ${PORT}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
    console.log(`- Directory: ${__dirname}`);
}).on('error', (err) => {
    console.error('[FATAL] Server failed to start:', err);
    process.exit(1);
});