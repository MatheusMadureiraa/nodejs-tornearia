const { app, BrowserWindow, ipcMain } = require("electron");
const { exec, spawn } = require("child_process");
const path = require("path");
const isDev = !app.isPackaged;

const serverPort = 3500;
let backendProcess = null;
let mainWindow = null;

function startBackend() {
    console.log("🚀 Verificando se o backend já está rodando...");

    require("http")
        .get(`http://localhost:${serverPort}`, () => {
            console.log("✅ Backend já está rodando! Pulando inicialização.");
            createWindow();
        })
        .on("error", () => {
            console.log("🛠️ Backend não encontrado. Iniciando agora...");

            if (isDev) {
                backendProcess = exec("npm run server", (err, stdout, stderr) => {
                    if (err) console.error(`❌ Erro ao iniciar o backend: ${stderr}`);
                    else console.log(`✅ Backend iniciado:\n${stdout}`);
                });
            } else {
                const serverPath = path.join(process.resourcesPath, "server", "server.js");
                backendProcess = spawn("node", [serverPath], { 
                    stdio: "inherit",
                    detached: false
                });
            }

            if (backendProcess) {
                backendProcess.on("exit", (code) => {
                    console.log(`⚠️ Backend foi encerrado com código: ${code}`);
                });

                backendProcess.on("error", (err) => {
                    console.error(`❌ Erro no processo do backend: ${err}`);
                });
            }

            setTimeout(() => checkBackend(), 3000);
        });
}

function checkBackend(attempts = 10) {
    require("http")
        .get(`http://localhost:${serverPort}`, () => {
            console.log("✅ Backend está rodando! Iniciando Electron...");
            createWindow();
        })
        .on("error", () => {
            if (attempts > 0) {
                console.log(`⏳ Backend ainda não iniciou... Tentando novamente (${attempts} tentativas restantes)`);
                setTimeout(() => checkBackend(attempts - 1), 2000);
            } else {
                console.error("❌ Falha ao conectar ao backend. Verifique se ele está rodando.");
                app.quit();
            }
        });
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, isDev ? "frontend/public/assets/logo.png" : "build/icon.png"),
        title: "Vallim Tornearia",
        show: false
    });

    const startUrl = isDev
        ? `file://${path.join(__dirname, "frontend", "views", "index.html")}`
        : `file://${path.join(app.getAppPath(), "frontend", "views", "index.html")}`;

    mainWindow.loadURL(startUrl);
    
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
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
};

// Gracefully shutdown backend process
function shutdownBackend() {
    if (backendProcess) {
        console.log("🛑 Encerrando backend...");
        
        if (process.platform === 'win32') {
            // For Windows, use taskkill to ensure process tree termination
            exec(`taskkill /pid ${backendProcess.pid} /T /F`, (error) => {
                if (error) {
                    console.error('Erro ao encerrar processo:', error);
                }
            });
        } else {
            // For Unix-like systems
            backendProcess.kill('SIGTERM');
            
            // Force kill if not terminated after 5 seconds
            setTimeout(() => {
                if (backendProcess && !backendProcess.killed) {
                    backendProcess.kill('SIGKILL');
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
    shutdownBackend();
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