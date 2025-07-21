const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const serverPort = 3500;
let backendProcess = null;
let mainWindow = null;

// Simple logging function
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

// Get backend server path
function getBackendPath() {
    return path.join(__dirname, "backend", "server.js");
}

// Start backend server
async function startBackend() {
    log("Starting backend server...");
    
    try {
        const serverPath = getBackendPath();
        log(`Backend path: ${serverPath}`);

        if (!fs.existsSync(serverPath)) {
            throw new Error(`Backend server not found at: ${serverPath}`);
        }

        const env = {
            ...process.env,
            PORT: serverPort.toString()
        };

        backendProcess = spawn(process.execPath, [serverPath], {
            stdio: ["pipe", "pipe", "pipe"],
            env: env,
            cwd: path.dirname(serverPath)
        });

        backendProcess.stdout.on('data', (data) => {
            log(`Backend: ${data.toString().trim()}`);
        });

        backendProcess.stderr.on('data', (data) => {
            log(`Backend Error: ${data.toString().trim()}`);
        });

        backendProcess.on('exit', (code) => {
            log(`Backend exited with code: ${code}`);
        });

        // Wait for backend to start
        setTimeout(() => {
            checkBackend();
        }, 3000);

    } catch (error) {
        log(`Failed to start backend: ${error.message}`);
        app.quit();
    }
}

// Check if backend is running
function checkBackend(attempts = 10) {
    const http = require("http");
    
    const request = http.get(`http://localhost:${serverPort}`, (res) => {
        log("Backend is ready!");
        createWindow();
    });

    request.on("error", () => {
        if (attempts > 0) {
            log(`Backend not ready, retrying... (${attempts} attempts left)`);
            setTimeout(() => checkBackend(attempts - 1), 1000);
        } else {
            log("Failed to connect to backend");
            app.quit();
        }
    });

    request.setTimeout(2000, () => {
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
            webSecurity: false
        },
        icon: path.join(__dirname, "build", "icon.png"),
        title: "Vallim Tornearia",
        show: false,
        autoHideMenuBar: true
    });

    const frontendPath = path.join(__dirname, "frontend", "views", "index.html");
    
    if (!fs.existsSync(frontendPath)) {
        log(`Frontend not found at: ${frontendPath}`);
        app.quit();
        return;
    }

    mainWindow.loadFile(frontendPath);
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        log("Window displayed");
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Shutdown backend
function shutdownBackend() {
    if (backendProcess) {
        log("Shutting down backend...");
        backendProcess.kill();
        backendProcess = null;
    }
}

// IPC handlers
ipcMain.on("app:close", () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.on("app:restart", () => {
    shutdownBackend();
    app.relaunch();
    app.exit();
});

// App events
app.whenReady().then(() => {
    log("App ready, starting backend...");
    startBackend();
});

app.on("window-all-closed", () => {
    shutdownBackend();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("before-quit", () => {
    shutdownBackend();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}