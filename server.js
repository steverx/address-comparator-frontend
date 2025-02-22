const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createServer } = require('http');

const app = express();
const DEFAULT_PORT = 8080;
let PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);

// Trust Railway's proxy and enable keep-alive
app.set('trust proxy', 1);
app.set('x-powered-by', false);

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.on('finish', () => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// Enhanced request logging
app.use((req, res, next) => {
    const startTime = Date.now();
    console.log('Request received:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: {
            host: req.get('host'),
            'x-forwarded-proto': req.get('x-forwarded-proto'),
            'x-forwarded-for': req.get('x-forwarded-for'),
            'x-real-ip': req.get('x-real-ip')
        }
    });

    // Log response completion
    res.on('finish', () => {
        console.log('Response sent:', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: Date.now() - startTime
        });
    });
    next();
});

// Add proxy middleware for API requests
if (process.env.NODE_ENV === 'development') {
    app.use('/api', createProxyMiddleware({
        target: process.env.REACT_APP_API_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api': ''
        },
        onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(500).json({ error: 'Proxy Error' });
        }
    }));
}

// Health check endpoint - MUST BE FIRST
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
    const debugInfo = {
        env: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN
        },
        networkInterfaces: require('os').networkInterfaces(),
        serverAddress: server.address(),
        headers: req.headers,
        build: {
            exists: fs.existsSync(path.join(__dirname, 'build')),
            files: fs.existsSync(path.join(__dirname, 'build')) ? 
                   fs.readdirSync(path.join(__dirname, 'build')) : []
        }
    };
    res.json(debugInfo);
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build'), {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        res.set('X-Content-Type-Options', 'nosniff');
        if (path.endsWith('.html')) {
            res.set('Content-Disposition', 'inline');
        }
    }
}));

// Error handler for static files
app.use((err, req, res, next) => {
    if (err.code === 'ENOENT') {
        console.error('Static file not found:', err.path);
        next();
    } else {
        console.error('Static file error:', err);
        next(err);
    }
});

// Handle React routing
app.get('*', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Enhanced server startup with port retry
const startServer = async (port) => {
    const server = createServer(app);
  
    try {
        await new Promise((resolve, reject) => {
            server.listen(port, '0.0.0.0');
            server.once('listening', resolve);
            server.once('error', reject);
        });
        
        const serverInfo = {
            port: port,
            env: process.env.NODE_ENV,
            domain: process.env.RAILWAY_PUBLIC_DOMAIN,
            pid: process.pid,
            platform: process.platform,
            nodeVersion: process.version,
            address: server.address(),
            connections: server.getConnections((err, count) => count),
            maxConnections: server.maxConnections,
            networkInterfaces: require('os').networkInterfaces(),
        };
        console.log('Server configuration:', serverInfo);
        console.log(`Server is running on port ${port}`);
        console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
        
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} in use, trying ${port + 1}...`);
            await startServer(port + 1);
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    }

    // Configure keep-alive
    server.keepAliveTimeout = 30000;
    server.headersTimeout = 31000;

    return server;
};

const server = startServer(PORT);

// Enhanced graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, starting graceful shutdown...');
    server.close(() => {
        console.log('Server closed successfully');
        process.exit(0);
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    server.close(() => process.exit(1));
});