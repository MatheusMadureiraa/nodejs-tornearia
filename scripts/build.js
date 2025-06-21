const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');

async function buildApp() {
    console.log('🚀 Starting build process...');
    
    // Ensure build directory exists
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
        console.log('📁 Creating build directory...');
        fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Check if icon files exist
    const iconFiles = ['icon.ico', 'icon.png', 'icon.icns'];
    iconFiles.forEach(iconFile => {
        const iconPath = path.join(buildDir, iconFile);
        if (!fs.existsSync(iconPath)) {
            console.warn(`⚠️ Warning: ${iconFile} not found in build directory`);
        }
    });
    
    try {
        const result = await builder.build({
            targets: builder.Platform.current().createTarget(),
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
                    'frontend/**/*',
                    'backend/**/*',
                    '!backend/uploads/**/*',
                    '!backend/backups/**/*',
                    '!backend/database/*.sqbpro',
                    '!backend/node_modules/**/*'
                ]
            }
        });
        
        console.log('✅ Build completed successfully!');
        console.log('📦 Output:', result);
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

buildApp();