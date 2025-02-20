const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve static files with caching headers
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.ico')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Explicit favicon handling with timeout
app.get('/favicon.ico', (req, res, next) => {
  const faviconPath = path.join(__dirname, 'build', 'favicon.ico');
  
  // Set a timeout for the favicon request
  const timeout = setTimeout(() => {
    next(new Error('Favicon request timeout'));
  }, 5000);

  res.sendFile(faviconPath, (err) => {
    clearTimeout(timeout);
    if (err) {
      // If favicon doesn't exist, return a 204 No Content
      if (err.code === 'ENOENT') {
        return res.status(204).end();
      }
      next(err);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main app route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle timeout errors specifically
  if (err.message === 'Favicon request timeout') {
    return res.status(504).json({ error: 'Request timeout' });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with explicit host binding
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});