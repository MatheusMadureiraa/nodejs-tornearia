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
        // In production, use process.resourcesPath for asar unpacked files
        return path.join(process.resourcesPath, 'app', relativePath);
    }
}

function getBackendPath() {
    if (isDev) {
        return path.join(__dirname, "backend", "server.js");
    } else {
        // In production, backend is in the app resources
        return path.join(process.resourcesPath, 'app', "backend", "server.js");
    }
}

function getDatabasePath() {
    if (isDev) {
        return path.join(__dirname, "backend", "database", "tornearia.db");
    } else {
        // In production, store database in user data directory
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'tornearia.db');
        
        // Copy initial database if it doesn't exist
        if (!fs.existsSync(dbPath)) {
            const initialDbPath = path.join(process.resourcesPath, 'app', "backend", "database", "tornearia.db");
            if (fs.existsSync(initialDbPath)) {
                try {
                    fs.copyFileSync(initialDbPath, dbPath);
                    console.log("✅ Database copied to user data directory");
                } catch (error) {
                    console.error("❌ Error copying database:", error);
                }
            }
        }
        
        return dbPath;
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
                
                // Try alternative paths
                const altPaths = [
                    path.join(__dirname, "backend", "server.js"),
                    path.join(app.getAppPath(), "backend", "server.js"),
                    path.join(process.resourcesPath, "backend", "server.js")
                ];
                
                let foundPath = null;
                for (const altPath of altPaths) {
                    if (fs.existsSync(altPath)) {
                        foundPath = altPath;
                        console.log("✅ Found server at:", altPath);
                        break;
                    }
                }
                
                if (!foundPath) {
                    console.error("❌ Server file not found in any location");
                    app.quit();
                    return;
                }
            }

            // Set environment variables for production
            if (!isDev) {
                process.env.DB_PATH = getDatabasePath();
                process.env.NODE_ENV = 'production';
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
                    stdio: ["pipe", "pipe", "pipe"],
                    detached: false,
                    cwd: backendDir,
                    env: {
                        ...process.env,
                        DB_PATH: getDatabasePath(),
                        NODE_ENV: 'production'
                    }
                });

                // Log backend output for debugging
                if (backendProcess.stdout) {
                    backendProcess.stdout.on('data', (data) => {
                        console.log(`Backend stdout: ${data}`);
                    });
                }

                if (backendProcess.stderr) {
                    backendProcess.stderr.on('data', (data) => {
                        console.error(`Backend stderr: ${data}`);
                    });
                }
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

function checkBackend(attempts = 15) {
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
    let frontendPath;
    
    if (isDev) {
        frontendPath = path.join(__dirname, "frontend", "views", "index.html");
    } else {
        // Try multiple possible paths in production
        const possiblePaths = [
            path.join(process.resourcesPath, 'app', "frontend", "views", "index.html"),
            path.join(app.getAppPath(), "frontend", "views", "index.html"),
            path.join(__dirname, "frontend", "views", "index.html")
        ];
        
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                frontendPath = possiblePath;
                break;
            }
        }
    }
    
    console.log("📁 Caminho do frontend:", frontendPath);

    // Verify frontend file exists
    if (!frontendPath || !fs.existsSync(frontendPath)) {
        console.error("❌ Arquivo frontend não encontrado:", frontendPath);
        console.error("❌ Nenhum arquivo frontend encontrado!");
        app.quit();
        return;
    }

    mainWindow.loadFile(frontendPath);
    
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
    console.log("📁 User data path:", app.getPath('userData'));
    console.log("🔧 Is packaged:", app.isPackaged);
    console.log("🔧 Is dev:", isDev);
    
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