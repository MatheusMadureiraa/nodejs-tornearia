const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');

async function buildApp() {
    console.log('🚀 Starting production build process...');
    
    // Verify Node.js version compatibility
    const nodeVersion = process.version;
    console.log(`📋 Node.js version: ${nodeVersion}`);
    
    // Check if icon files exist
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
        console.log('📁 Creating build directory...');
        fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Check for required files
    const requiredFiles = [
        'main.js',
        'preload.js',
        'package.json',
        'backend/server.js',
        'frontend/views/index.html'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Required file missing: ${file}`);
            process.exit(1);
        }
    }
    
    // Create a simple icon if it doesn't exist
    const iconPath = path.join(buildDir, 'icon.ico');
    if (!fs.existsSync(iconPath)) {
        console.log('⚠️ Warning: icon.ico not found in build directory');
        console.log('The build will continue but the app may not have an icon');
    }
    
    try {
        console.log('🔨 Building application...');
        
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
                    'node_modules/**/*',
                    '!backend/uploads/**/*',
                    '!backend/backups/**/*',
                    '!backend/database/*.sqbpro',
                    '!backend/database/tornearia.db',
                    '!tests/**/*',
                    '!scripts/**/*',
                    '!*.md',
                    '!.gitignore'
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
                    icon: 'build/icon.ico',
                    requestedExecutionLevel: 'asInvoker'
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    shortcutName: 'Vallim Tornearia',
                    installerIcon: 'build/icon.ico',
                    uninstallerIcon: 'build/icon.ico',
                    allowElevation: true,
                    perMachine: false,
                    runAfterFinish: true
                }
            }
        });
        
        console.log('✅ Build completed successfully!');
        console.log('📦 Check the dist folder for your executable');
        console.log('');
        console.log('📋 Installation Instructions:');
        console.log('1. Run the generated .exe file as administrator');
        console.log('2. Follow the installation wizard');
        console.log('3. The app will create its database in the user data folder');
        console.log('4. First startup may take 10-15 seconds');
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('1. Make sure all dependencies are installed: npm install');
        console.error('2. Check that Node.js version is compatible');
        console.error('3. Verify that all required files exist');
        console.error('4. Try cleaning node_modules and reinstalling');
        process.exit(1);
    }
}

buildApp();