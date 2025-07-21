const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const serverPort = 3500;
let backendProcess = null;
let mainWindow = null;
let isQuitting = false;

// Enhanced logging function
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} [MAIN] ${message}`);
}

// Get backend server path - works in both dev and production
function getBackendPath() {
    if (app.isPackaged) {
        // In production, the backend is in resources/app.asar.unpacked
        return path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'server.js');
    } else {
        // In development
        return path.join(__dirname, "backend", "server.js");
    }
}

// Get frontend path - works in both dev and production
function getFrontendPath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app.asar.unpacked', 'frontend', 'views', 'index.html');
    } else {
        return path.join(__dirname, "frontend", "views", "index.html");
    }
}

// Start backend server with enhanced error handling
async function startBackend() {
    return new Promise((resolve, reject) => {
        log("Starting backend server...");
        
        try {
            const serverPath = getBackendPath();
            log(`Backend path: ${serverPath}`);
            log(`App packaged: ${app.isPackaged}`);
            log(`Process cwd: ${process.cwd()}`);
            log(`__dirname: ${__dirname}`);

            if (!fs.existsSync(serverPath)) {
                const error = `Backend server not found at: ${serverPath}`;
                log(error, 'error');
                reject(new Error(error));
                return;
            }

            const env = {
                ...process.env,
                PORT: serverPort.toString(),
                NODE_ENV: app.isPackaged ? 'production' : 'development',
                ELECTRON_RUN_AS_NODE: '1'
            };

            // Use the Node.js executable that comes with Electron
            const nodePath = process.execPath;
            log(`Using Node.js from: ${nodePath}`);

            backendProcess = spawn(nodePath, [serverPath], {
                stdio: ["pipe", "pipe", "pipe"],
                env: env,
                cwd: path.dirname(serverPath),
                detached: false
            });

            let backendReady = false;

            backendProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                log(`Backend: ${output}`);
                
                // Check if backend is ready
                if (output.includes('Server is ready to accept connections') || 
                    output.includes(`Servidor rodando no endereço http://127.0.0.1:${serverPort}`)) {
                    if (!backendReady) {
                        backendReady = true;
                        log("Backend startup detected, checking connection...");
                        setTimeout(() => checkBackend(resolve, reject), 2000);
                    }
                }
            });

            backendProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                log(`Backend Error: ${error}`, 'error');
            });

            backendProcess.on('exit', (code, signal) => {
                log(`Backend exited with code: ${code}, signal: ${signal}`);
                if (!backendReady && !isQuitting) {
                    reject(new Error(`Backend failed to start (exit code: ${code})`));
                }
            });

            backendProcess.on('error', (error) => {
                log(`Backend spawn error: ${error.message}`, 'error');
                reject(error);
            });

            // Fallback timeout
            setTimeout(() => {
                if (!backendReady) {
                    log("Backend startup timeout, attempting connection check...");
                    checkBackend(resolve, reject);
                }
            }, 10000);

        } catch (error) {
            log(`Failed to start backend: ${error.message}`, 'error');
            reject(error);
        }
    });
}

// Check if backend is running with retry logic
function checkBackend(resolve, reject, attempts = 15) {
    const http = require("http");
    
    log(`Checking backend connection (attempt ${16 - attempts}/15)...`);
    
    const request = http.get(`http://localhost:${serverPort}`, (res) => {
        log("✅ Backend is ready and responding!");
        resolve();
    });

    request.on("error", (error) => {
        if (attempts > 0) {
            log(`Backend not ready, retrying... (${attempts} attempts left)`);
            setTimeout(() => checkBackend(resolve, reject, attempts - 1), 1000);
        } else {
            const errorMsg = `Failed to connect to backend after 15 attempts: ${error.message}`;
            log(errorMsg, 'error');
            reject(new Error(errorMsg));
        }
    });

    request.setTimeout(3000, () => {
        request.destroy();
    });
}

// Create main window
function createWindow() {
    log("Creating main window...");
    
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            enableRemoteModule: false
        },
        icon: getAppIcon(),
        title: "Vallim Tornearia",
        show: false,
        autoHideMenuBar: true,
        backgroundColor: '#f8f9fa'
    });

    const frontendPath = getFrontendPath();
    log(`Loading frontend from: ${frontendPath}`);
    
    if (!fs.existsSync(frontendPath)) {
        log(`Frontend not found at: ${frontendPath}`, 'error');
        showErrorDialog('Frontend files not found', `Could not find frontend files at: ${frontendPath}`);
        return;
    }

    mainWindow.loadFile(frontendPath);
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        log("✅ Window displayed successfully");
        
        // Optional: Open DevTools in development
        if (!app.isPackaged) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle navigation errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        log(`Failed to load: ${errorDescription} (${errorCode}) - ${validatedURL}`, 'error');
    });

    // Log when page finishes loading
    mainWindow.webContents.on('did-finish-load', () => {
        log("Frontend page loaded successfully");
    });
}

// Get app icon path
function getAppIcon() {
    const iconPaths = [
        path.join(__dirname, "build", "icon.png"),
        path.join(__dirname, "build", "icon.ico"),
        path.join(__dirname, "assets", "logo.png")
    ];
    
    for (const iconPath of iconPaths) {
        if (fs.existsSync(iconPath)) {
            log(`Using icon: ${iconPath}`);
            return iconPath;
        }
    }
    
    log("No icon found, using default", 'warn');
    return undefined;
}

// Show error dialog
function showErrorDialog(title, message) {
    const { dialog } = require('electron');
    dialog.showErrorBox(title, message);
}

// Shutdown backend gracefully
function shutdownBackend() {
    return new Promise((resolve) => {
        if (backendProcess && !backendProcess.killed) {
            log("Shutting down backend...");
            
            backendProcess.on('exit', () => {
                log("Backend shutdown complete");
                backendProcess = null;
                resolve();
            });
            
            // Try graceful shutdown first
            backendProcess.kill('SIGTERM');
            
            // Force kill after 5 seconds
            setTimeout(() => {
                if (backendProcess && !backendProcess.killed) {
                    log("Force killing backend process", 'warn');
                    backendProcess.kill('SIGKILL');
                    backendProcess = null;
                }
                resolve();
            }, 5000);
        } else {
            resolve();
        }
    });
}

// IPC handlers
ipcMain.on("app:close", () => {
    log("Received app:close request");
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.on("app:restart", async () => {
    log("Received app:restart request");
    isQuitting = true;
    await shutdownBackend();
    app.relaunch();
    app.exit();
});

// App event handlers
app.whenReady().then(async () => {
    log("🚀 App ready, starting initialization...");
    log(`Electron version: ${process.versions.electron}`);
    log(`Node version: ${process.versions.node}`);
    log(`Platform: ${process.platform}`);
    log(`Architecture: ${process.arch}`);
    
    try {
        await startBackend();
        createWindow();
    } catch (error) {
        log(`Initialization failed: ${error.message}`, 'error');
        showErrorDialog('Startup Error', `Failed to start application: ${error.message}`);
        app.quit();
    }
});

app.on("window-all-closed", async () => {
    log("All windows closed");
    isQuitting = true;
    await shutdownBackend();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("before-quit", async (event) => {
    if (!isQuitting) {
        event.preventDefault();
        isQuitting = true;
        log("App is quitting, shutting down backend...");
        await shutdownBackend();
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    log("Another instance is already running, quitting...");
    app.quit();
} else {
    app.on('second-instance', () => {
        log("Second instance attempted, focusing main window");
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error.message}`, 'error');
    log(`Stack: ${error.stack}`, 'error');
});

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
});