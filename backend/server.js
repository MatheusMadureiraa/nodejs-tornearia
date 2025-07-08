const app = require('./app.js');

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
log(`Working directory: ${process.cwd()}`);
log(`Environment: ${process.env.NODE_ENV || 'development'}`);
log(`Database path: ${process.env.DB_PATH || 'default'}`);

const server = app.listen(PORT, '127.0.0.1', () => {
    log(`✅ Servidor rodando no endereço http://127.0.0.1:${PORT}`);
    log(`✅ Server is ready to accept connections`);
});

// Enhanced error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        log(`❌ Port ${PORT} is already in use. Please close other applications using this port.`, 'error');
    } else if (error.code === 'EACCES') {
        log(`❌ Permission denied to bind to port ${PORT}. Try running as administrator.`, 'error');
    } else {
        log(`❌ Server error: ${error.message}`, 'error');
    }
    process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
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

module.exports = server;