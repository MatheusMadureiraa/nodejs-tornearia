const { app, BrowserWindow, ipcMain } = require("electron");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;
const serverPort = 3500;
let backendProcess = null;
let mainWindow = null;

// Get correct paths for production and development
function getResourcePath(relativePath) {
    if (isDev) {
        return path.join(__dirname, relativePath);
    } else {
        // In production, files are in the app.getAppPath()
        return path.join(app.getAppPath(), relativePath);
    }
}

function getBackendPath() {
    if (isDev) {
        return path.join(__dirname, "backend", "server.js");
    } else {
        // In production, backend is in the app resources
        return path.join(app.getAppPath(), "backend", "server.js");
    }
}

function startBackend() {
    console.log("🚀 Verificando se o backend já está rodando...");

    require("http")
        .get(`http://localhost:${serverPort}`, () => {
            console.log("✅ Backend já está rodando! Pulando inicialização.");
            createWindow();
        })
        .on("error", () => {
            console.log("🛠️ Backend não encontrado. Iniciando agora...");

            const serverPath = getBackendPath();
            console.log("📁 Caminho do servidor:", serverPath);

            // Verify server file exists
            if (!fs.existsSync(serverPath)) {
                console.error("❌ Arquivo do servidor não encontrado:", serverPath);
                app.quit();
                return;
            }

            if (isDev) {
                backendProcess = exec("npm run server", (err, stdout, stderr) => {
                    if (err) console.error(`❌ Erro ao iniciar o backend: ${stderr}`);
                    else console.log(`✅ Backend iniciado:\n${stdout}`);
                });
            } else {
                // Set working directory to the backend folder
                const backendDir = path.dirname(serverPath);
                backendProcess = spawn("node", [serverPath], { 
                    stdio: "inherit",
                    detached: false,
                    cwd: backendDir
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

    // Get the correct path to index.html
    const frontendPath = getResourcePath(path.join("frontend", "views", "index.html"));
    console.log("📁 Caminho do frontend:", frontendPath);

    // Verify frontend file exists
    if (!fs.existsSync(frontendPath)) {
        console.error("❌ Arquivo frontend não encontrado:", frontendPath);
        
        // Try alternative paths
        const altPath1 = path.join(app.getAppPath(), "frontend", "views", "index.html");
        const altPath2 = path.join(process.resourcesPath, "frontend", "views", "index.html");
        
        console.log("🔍 Tentando caminhos alternativos:");
        console.log("Alt 1:", altPath1, "Existe:", fs.existsSync(altPath1));
        console.log("Alt 2:", altPath2, "Existe:", fs.existsSync(altPath2));
        
        if (fs.existsSync(altPath1)) {
            mainWindow.loadFile(altPath1);
        } else if (fs.existsSync(altPath2)) {
            mainWindow.loadFile(altPath2);
        } else {
            console.error("❌ Nenhum arquivo frontend encontrado!");
            app.quit();
            return;
        }
    } else {
        mainWindow.loadFile(frontendPath);
    }
    
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log("✅ Janela principal exibida");
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
        console.error('❌ Falha ao carregar:', errorCode, errorDescription, validatedURL);
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
    console.log("🚀 Aplicação Electron iniciada");
    console.log("📁 App path:", app.getAppPath());
    console.log("📁 Resources path:", process.resourcesPath);
    console.log("🔧 Is packaged:", app.isPackaged);
    
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