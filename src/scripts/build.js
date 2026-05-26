const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');

async function buildApp() {
    console.log('🚀 Starting build process...');
    
    // Check if icon files exist
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
        console.log('📁 Creating build directory...');
        fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Create a simple icon if it doesn't exist
    const iconPath = path.join(buildDir, 'icon.ico');
    if (!fs.existsSync(iconPath)) {
        console.log('⚠️ Warning: icon.ico not found in build directory');
        console.log('The build will continue but the app may not have an icon');
    }
    
    try {
        const result = await builder.build({
            targets: builder.Platform.WINDOWS.createTarget(),
            config: {
                appId: 'com.vallim.tornearia',
                productName: 'Vallim Tornearia',
                directories: {
                    output: 'dist'
                },
                files: [
                    'main.js',
                    'preload.js',
                    'package.json',
                    'backend/**/*',
                    'frontend/**/*',
                    '!backend/uploads/**/*',
                    '!backend/backups/**/*',
                    '!backend/database/*.sqbpro'
                ],
                asarUnpack: [
                    'backend/**/*',
                    'frontend/**/*',
                    'node_modules/sqlite3/**/*'
                ],
                win: {
                    target: {
                        target: 'nsis',
                        arch: ['x64', 'ia32']
                    },
                    icon: 'build/icon.ico'
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    shortcutName: 'Vallim Tornearia',
                    installerIcon: 'build/icon.ico',
                    uninstallerIcon: 'build/icon.ico',
                    allowElevation: true
                }
            }
        });
        
        console.log('✅ Build completed successfully!');
        console.log('📦 Check the dist folder for your executable');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

buildApp();