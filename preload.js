const { contextBridge, ipcRenderer } = require('electron');

// Enhanced logging for preload
console.log('🔌 Preload script loaded');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
    fecharApp: () => {
        console.log('🚪 Closing app via API');
        ipcRenderer.send('app:close');
    },
    restartApp: () => {
        console.log('🔄 Restarting app via API');
        ipcRenderer.send('app:restart');
    }
});

console.log('✅ Preload API exposed to renderer');