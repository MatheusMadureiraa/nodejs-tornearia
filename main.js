const { app, BrowserWindow } = require("electron");
const { exec, spawn } = require("child_process");
const path = require("path");
const isDev = !app.isPackaged;
const { ipcMain } = require("electron");

const serverPort = 3500;
let backendProcess = null;

function startBackend() {
    console.log("🚀 Verificando se o backend já está rodando...");

    require("http")
        .get(`http://localhost:${serverPort}`, () => {
            console.log("✅ Backend já está rodando! Pulando inicialização.");
            createWindow(); // Só cria a janela se o backend já estiver rodando
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
                backendProcess = spawn("node", [serverPath], { stdio: "inherit" });
            }

            backendProcess.on("exit", (code) => {
                console.log(`⚠️ Backend foi encerrado com código: ${code}`);
            });

            setTimeout(() => checkBackend(), 2000); // Espera backend subir antes de iniciar Electron
        });
}

function checkBackend(attempts = 5) {
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
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    const startUrl = isDev
        ? `file://${path.join(__dirname, "frontend", "views", "index.html")}`
        : `file://${path.join(app.getAppPath(), "frontend", "views", "index.html")}`;

    win.loadURL(startUrl);
};

ipcMain.on("app:close", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.close();
});

app.whenReady().then(() => {
    startBackend();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (backendProcess) {
        console.log("🛑 Encerrando backend...");
        backendProcess.kill(); 
    }

    if (process.platform !== "darwin") {
        app.quit();
    }
});

