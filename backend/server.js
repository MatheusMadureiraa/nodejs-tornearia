const app = require('./app.js');
const os = require('os');

const PORT = process.env.PORT || 3500;

// Enhanced logging for production debugging
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} [SERVER] ${message}`);
}

// Log startup information
log(`Starting server...`);
log(`Node.js version: ${process.version}`);
log(`Platform: ${process.platform}`);
log(`Architecture: ${process.arch}`);
log(`OS: ${os.type()} ${os.release()}`);
log(`Total memory: ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
log(`Free memory: ${Math.round(os.freemem() / 1024 / 1024)} MB`);
log(`Working directory: ${process.cwd()}`);
log(`Environment: ${process.env.NODE_ENV || 'development'}`);
log(`Database path: ${process.env.DB_PATH || 'default'}`);
log(`Process ID: ${process.pid}`);

// Try to bind to localhost first, then fallback to all interfaces
const server = app.listen(PORT, 'localhost', () => {
    log(`✅ Servidor rodando no endereço http://127.0.0.1:${PORT}`);
    log(`✅ Server is ready to accept connections`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        log(`❌ Port ${PORT} is already in use. Trying to find alternative...`, 'error');
        // Try alternative port
        const altPort = PORT + 1;
        log(`Trying alternative port: ${altPort}`);
        const altServer = app.listen(altPort, 'localhost', () => {
            log(`✅ Server started on alternative port: http://127.0.0.1:${altPort}`);
        });
        setupServerHandlers(altServer, altPort);
    } else if (error.code === 'EACCES') {
        log(`❌ Permission denied to bind to port ${PORT}. Try running as administrator.`, 'error');
        process.exit(1);
    } else {
        log(`❌ Server error: ${error.message}`, 'error');
        process.exit(1);
    }
});

function setupServerHandlers(serverInstance, port) {
    // Enhanced error handling
    serverInstance.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            log(`❌ Port ${port} is already in use. Please close other applications using this port.`, 'error');
        } else if (error.code === 'EACCES') {
            log(`❌ Permission denied to bind to port ${port}. Try running as administrator.`, 'error');
        } else {
            log(`❌ Server error: ${error.message}`, 'error');
        }
        process.exit(1);
    });

    // Connection handling
    serverInstance.on('connection', (socket) => {
        log(`New connection from ${socket.remoteAddress}:${socket.remotePort}`);
        
        socket.on('error', (err) => {
            log(`Socket error: ${err.message}`, 'warn');
        });
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
        log('🛑 SIGTERM received, shutting down gracefully...');
        serverInstance.close(() => {
            log('✅ Server closed successfully');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        log('🛑 SIGINT received, shutting down gracefully...');
        serverInstance.close(() => {
            log('✅ Server closed successfully');
            process.exit(0);
        });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        log(`❌ Uncaught Exception: ${error.message}`, 'error');
        log(`❌ Stack: ${error.stack}`, 'error');
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
    });
}

// Setup handlers for the main server
setupServerHandlers(server, PORT);

module.exports = server;