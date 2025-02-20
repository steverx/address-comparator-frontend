const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
let PORT = parseInt(process.env.PORT || '8080', 10);

// Trust Railway's proxy and enable keep-alive
app.set('trust proxy', 1);
app.set('x-powered-by', false);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check with enhanced info
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connection: {
            protocol: req.protocol,
            secure: req.secure,
            ip: req.ip,
            hostname: req.hostname,
            proxy: req.get('x-forwarded-proto') || 'none'
        },
        server: {
            port: PORT,
            env: process.env.NODE_ENV,
            domain: process.env.RAILWAY_PUBLIC_DOMAIN,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid
        },
        build: {
            exists: fs.existsSync(path.join(__dirname, 'build')),
            directory: path.join(__dirname, 'build')
        }
    };
    console.log('Health check:', health);
    res.status(200).json(health);
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

// Static file serving
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

// SPA route with error handling
app.get('*', (req, res, next) => {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    res.set({
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff'
    });
    res.sendFile(indexPath, err => {
        if (err) {
            console.error('Error serving index.html:', err);
            next(err);
        }
    });
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
const startServer = (retries = 3) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
        const serverInfo = {
            port: PORT,
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
    }).on('error', (error) => {
        if (error.code === 'EADDRINUSE' && retries > 0) {
            console.log(`Port ${PORT} in use, retrying on port ${PORT + 1}...`);
            server.close();
            PORT += 1;
            startServer(retries - 1);
        } else {
            console.error('Server failed to start:', {
                error: error.message,
                code: error.code,
                port: PORT,
                time: new Date().toISOString()
            });
            process.exit(1);
        }
    });

    // Configure keep-alive
    server.keepAliveTimeout = 30000;
    server.headersTimeout = 31000;

    return server;
};

const server = startServer();

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