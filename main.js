const { app, BrowserWindow, ipcMain } = require("electron");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;
const serverPort = 3500;
let backendProcess = null;
let mainWindow = null;
let isShuttingDown = false;

// Enhanced logging function
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

// Get correct paths for production and development
function getResourcePath(relativePath) {
    if (isDev) {
        return path.join(__dirname, relativePath);
    } else {
        // In production, files are unpacked due to asarUnpack configuration
        return path.join(__dirname, relativePath);
    }
}

function getBackendPath() {
    if (isDev) {
        return path.join(__dirname, "backend", "server.js");
    } else {
        // In production, backend is unpacked in the same directory structure
        const backendPath = path.join(__dirname, "backend", "server.js");
        log(`Looking for backend at: ${backendPath}`);
        
        if (fs.existsSync(backendPath)) {
            return backendPath;
        }
        
        // Fallback paths
        const fallbackPaths = [
            path.join(process.resourcesPath, 'app', "backend", "server.js"),
            path.join(app.getAppPath(), "backend", "server.js"),
            path.join(process.resourcesPath, 'app.asar.unpacked', "backend", "server.js")
        ];
        
        for (const fallbackPath of fallbackPaths) {
            log(`Trying fallback path: ${fallbackPath}`);
            if (fs.existsSync(fallbackPath)) {
                return fallbackPath;
            }
        }
        
        throw new Error("Backend server.js not found in any expected location");
    }
}

function getDatabasePath() {
    if (isDev) {
        return path.join(__dirname, "backend", "database", "tornearia.db");
    } else {
        // In production, store database in user data directory
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'tornearia.db');
        
        log(`Database will be stored at: ${dbPath}`);
        
        // Ensure user data directory exists
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
            log(`Created user data directory: ${userDataPath}`);
        }
        
        // Copy initial database if it doesn't exist
        if (!fs.existsSync(dbPath)) {
            const possibleInitialPaths = [
                path.join(__dirname, "backend", "database", "tornearia.db"),
                path.join(process.resourcesPath, 'app', "backend", "database", "tornearia.db"),
                path.join(app.getAppPath(), "backend", "database", "tornearia.db")
            ];
            
            for (const initialDbPath of possibleInitialPaths) {
                if (fs.existsSync(initialDbPath)) {
                    try {
                        fs.copyFileSync(initialDbPath, dbPath);
                        log(`Database copied from ${initialDbPath} to ${dbPath}`);
                        break;
                    } catch (error) {
                        log(`Error copying database from ${initialDbPath}: ${error.message}`, 'error');
                    }
                }
            }
        }
        
        return dbPath;
    }
}

function isPortInUse(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(false); // Port is available
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(true); // Port is in use
        });
    });
}

async function startBackend() {
    log("🚀 Starting backend initialization...");
    
    if (isShuttingDown) {
        log("Application is shutting down, skipping backend start");
        return;
    }

    // Check if port is already in use
    const portInUse = await isPortInUse(serverPort);
    if (portInUse) {
        log(`Port ${serverPort} is already in use. Checking if it's our backend...`);
        
        // Test if it's our backend responding
        require("http")
            .get(`http://localhost:${serverPort}`, (res) => {
                log("✅ Backend already running and responding! Skipping initialization.");
                createWindow();
            })
            .on("error", () => {
                log(`Port ${serverPort} is occupied by another service. Cannot start backend.`, 'error');
                showErrorDialog('Port Error', `Port ${serverPort} is already in use by another application. Please close other applications and try again.`);
            });
        return;
    }

    try {
        const serverPath = getBackendPath();
        log(`Backend server path: ${serverPath}`);

        // Verify server file exists
        if (!fs.existsSync(serverPath)) {
            throw new Error(`Backend server file not found at: ${serverPath}`);
        }

        // Set environment variables for production
        const env = {
            ...process.env,
            NODE_ENV: isDev ? 'development' : 'production',
            PORT: serverPort.toString(),
            ELECTRON_RUN_AS_NODE: '1'
        };

        if (!isDev) {
            env.DB_PATH = getDatabasePath();
        }

        log(`Environment: ${env.NODE_ENV}`);
        log(`Database path: ${env.DB_PATH || 'default'}`);
        log(`Node.js version: ${process.version}`);
        log(`Platform: ${process.platform} ${process.arch}`);

        if (isDev) {
            log("Starting backend in development mode...");
            backendProcess = exec("npm run server", { env }, (err, stdout, stderr) => {
                if (err) {
                    log(`Error starting backend: ${stderr}`, 'error');
                    showErrorDialog('Backend Error', 'Failed to start backend in development mode.');
                } else {
                    log(`Backend output: ${stdout}`);
                }
            });
        } else {
            log("Starting backend in production mode...");
            
            // Get the directory containing the server file
            const backendDir = path.dirname(serverPath);
            log(`Backend working directory: ${backendDir}`);
            
            // Use the bundled Node.js executable for better compatibility
            const nodeExecutable = process.execPath;
            log(`Using Node.js executable: ${nodeExecutable}`);
            
            // Start the backend process
            backendProcess = spawn(nodeExecutable, [serverPath], { 
                stdio: ["pipe", "pipe", "pipe"],
                detached: false,
                cwd: backendDir,
                env: env,
                windowsHide: true,
                shell: false
            });

            // Enhanced logging for backend output
            if (backendProcess.stdout) {
                backendProcess.stdout.on('data', (data) => {
                    const output = data.toString().trim();
                    if (output) {
                        log(`Backend stdout: ${output}`);
                    }
                });
            }

            if (backendProcess.stderr) {
                backendProcess.stderr.on('data', (data) => {
                    const output = data.toString().trim();
                    if (output) {
                        log(`Backend stderr: ${output}`, 'warn');
                    }
                });
            }
        }

        if (backendProcess) {
            backendProcess.on("exit", (code, signal) => {
                const logType = (code === 0 || isShuttingDown) ? 'info' : 'error';
                log(`Backend process exited with code: ${code}, signal: ${signal}`, logType);
                
                if (!isShuttingDown && code !== 0) {
                    showErrorDialog('Backend Crashed', 'The backend process has crashed unexpectedly. The application will close.');
                    setTimeout(() => app.quit(), 3000);
                }
            });

            backendProcess.on("error", (err) => {
                log(`Backend process error: ${err.message}`, 'error');
                if (!isShuttingDown) {
                    showErrorDialog('Backend Error', `Failed to start backend: ${err.message}`);
                }
            });

            // Give the backend more time to start
            log("Waiting for backend to start...");
            setTimeout(() => checkBackend(), 3000);
        }

    } catch (error) {
        log(`Failed to start backend: ${error.message}`, 'error');
        showErrorDialog('Startup Error', `Failed to initialize backend: ${error.message}`);
    }
}

function checkBackend(attempts = 30) {
    log(`Checking backend connectivity... (${attempts} attempts remaining)`);
    
    const request = require("http").get(`http://localhost:${serverPort}`, (res) => {
        log("✅ Backend is responding! Starting Electron window...");
        createWindow();
    });

    request.on("error", (err) => {
        if (attempts > 0) {
            log(`Backend not ready yet (${err.code}). Retrying in 1 second...`, 'warn');
            setTimeout(() => checkBackend(attempts - 1), 1000);
        } else {
            log("❌ Failed to connect to backend after multiple attempts.", 'error');
            log("This usually means the backend process failed to start.", 'error');
            
            showErrorDialog(
                'Initialization Error',
                'The internal server could not start. Please check if port 3500 is available and try again.\n\nIf the problem persists, try running as administrator.'
            );
        }
    });

    // Set timeout for the request
    request.setTimeout(3000, () => {
        request.destroy();
    });
}

function showErrorDialog(title, message) {
    const { dialog } = require('electron');
    dialog.showErrorBox(title, message);
    setTimeout(() => app.quit(), 2000);
}

const createWindow = () => {
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
            webSecurity: true
        },
        icon: path.join(__dirname, isDev ? "frontend/public/assets/logo.png" : "build/icon.png"),
        title: "Vallim Tornearia",
        show: false,
        autoHideMenuBar: true
    });

    // Get the correct path to index.html
    let frontendPath;
    
    if (isDev) {
        frontendPath = path.join(__dirname, "frontend", "views", "index.html");
    } else {
        // In production, frontend is unpacked in the same directory structure
        frontendPath = path.join(__dirname, "frontend", "views", "index.html");
        
        if (!fs.existsSync(frontendPath)) {
            // Try alternative paths
            const possiblePaths = [
                path.join(process.resourcesPath, 'app', "frontend", "views", "index.html"),
                path.join(app.getAppPath(), "frontend", "views", "index.html"),
                path.join(process.resourcesPath, 'app.asar.unpacked', "frontend", "views", "index.html")
            ];
            
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    frontendPath = possiblePath;
                    break;
                }
            }
        }
    }
    
    log(`Frontend path: ${frontendPath}`);

    // Verify frontend file exists
    if (!frontendPath || !fs.existsSync(frontendPath)) {
        log(`Frontend file not found at: ${frontendPath}`, 'error');
        showErrorDialog('Frontend Error', 'Frontend files not found. Please reinstall the application.');
        return;
    }

    mainWindow.loadFile(frontendPath);
    
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        log("✅ Main window displayed");
    });
    
    // Open DevTools only in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Prevent new window creation
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // Add error handling for failed loads
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        log(`Failed to load: ${errorCode} ${errorDescription} ${validatedURL}`, 'error');
    });
    
    // Handle unresponsive window
    mainWindow.on('unresponsive', () => {
        log('Main window became unresponsive', 'warn');
    });
    
    mainWindow.on('responsive', () => {
        log('Main window became responsive again');
    });
};

// Gracefully shutdown backend process
function shutdownBackend() {
    isShuttingDown = true;
    
    if (backendProcess) {
        log("🛑 Shutting down backend...");
        
        if (process.platform === 'win32') {
            // For Windows, use taskkill to ensure process tree termination
            const killCommand = `taskkill /pid ${backendProcess.pid} /T /F`;
            log(`Executing: ${killCommand}`);
            exec(killCommand, (error) => {
                if (error) {
                    log(`Error terminating process: ${error.message}`, 'error');
                } else {
                    log("Backend process terminated successfully");
                }
            });
        } else {
            // For Unix-like systems
            backendProcess.kill('SIGTERM');
            
            // Force kill if not terminated after 5 seconds
            setTimeout(() => {
                if (backendProcess && !backendProcess.killed) {
                    backendProcess.kill('SIGKILL');
                    log("Backend process force killed");
                }
            }, 5000);
        }
        
        backendProcess = null;
    }
}

// IPC handlers
ipcMain.on("app:close", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        focusedWindow.close();
    }
});

ipcMain.on("app:restart", () => {
    shutdownBackend();
    app.relaunch();
    app.exit();
});

// App event handlers
app.whenReady().then(() => {
    log("🚀 Electron application started");
    log(`App path: ${app.getAppPath()}`);
    log(`Resources path: ${process.resourcesPath}`);
    log(`User data path: ${app.getPath('userData')}`);
    log(`Is packaged: ${app.isPackaged}`);
    log(`Is dev: ${isDev}`);
    log(`Platform: ${process.platform}`);
    log(`Architecture: ${process.arch}`);
    log(`Electron version: ${process.versions.electron}`);
    log(`Chrome version: ${process.versions.chrome}`);
    log(`Node version: ${process.versions.node}`);
    
    startBackend();
    
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    shutdownBackend();
    
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("before-quit", (event) => {
    if (backendProcess && !isShuttingDown) {
        event.preventDefault();
        isShuttingDown = true;
        shutdownBackend();
        setTimeout(() => {
            app.quit();
        }, 2000);
    }
});

// Handle app termination signals
process.on('SIGINT', () => {
    shutdownBackend();
    app.quit();
});

process.on('SIGTERM', () => {
    shutdownBackend();
    app.quit();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}