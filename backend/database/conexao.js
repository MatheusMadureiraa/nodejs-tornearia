const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

// Get the correct database path for both development and production
function getDatabasePath() {
    const isProduction = process.env.NODE_ENV === 'production' || process.pkg || process.env.ELECTRON_RUN_AS_NODE;
    
    if (isProduction) {
        // In production, store database in user data directory
        let userDataPath;
        
        try {
            // Try to get Electron's userData path
            if (process.env.ELECTRON_RUN_AS_NODE) {
                // We're running as a child process of Electron
                userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'tornearia-vallim');
            } else {
                const { app } = require('electron');
                userDataPath = app ? app.getPath('userData') : path.join(os.homedir(), 'AppData', 'Roaming', 'tornearia-vallim');
            }
        } catch (error) {
            // Fallback if electron is not available
            console.log('Electron not available, using fallback path');
            userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'tornearia-vallim');
        }
        
        // Ensure directory exists
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
            console.log(`Created user data directory: ${userDataPath}`);
        }
        
        return path.join(userDataPath, 'tornearia.db');
    } else {
        // In development, use local path or environment variable
        const devPath = process.env.DB_PATH || path.resolve(__dirname, 'tornearia.db');
        console.log('Development database path:', devPath);
        return process.env.DB_PATH || path.resolve(__dirname, 'tornearia.db');
    }
}

const dbPath = getDatabasePath();
console.log('📁 Database path:', dbPath);
console.log('📁 Database directory exists:', fs.existsSync(path.dirname(dbPath)));
console.log('📁 Database file exists:', fs.existsSync(dbPath));

let dbInstance = null;

const getDBConnection = () => {
    if (!dbInstance) {
        // Add more detailed error handling for database connection
        dbInstance = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err.message);
                console.error('Database path attempted:', dbPath);
                console.error('Current working directory:', process.cwd());
                console.error('User home directory:', os.homedir());
                
                // Try to create directory if it doesn't exist
                const dbDir = path.dirname(dbPath);
                if (!fs.existsSync(dbDir)) {
                    try {
                        fs.mkdirSync(dbDir, { recursive: true });
                        console.log('Created database directory:', dbDir);
                        
                        // Retry connection
                        dbInstance = new sqlite3.Database(dbPath, (retryErr) => {
                            if (retryErr) {
                                console.error('Retry connection failed:', retryErr.message);
                                process.exit(1);
                            } else {
                                console.log('Database connection successful on retry');
                                initializeTables();
                            }
                        });
                    } catch (mkdirErr) {
                        console.error('Failed to create database directory:', mkdirErr.message);
                        process.exit(1);
                    }
                } else {
                    process.exit(1);
                }
            } else {
                console.log('Conectado ao banco de dados SQLite.');
                console.log('📁 Database location:', dbPath);
                console.log('📁 Database size:', fs.existsSync(dbPath) ? fs.statSync(dbPath).size + ' bytes' : 'New database');
                
                // Initialize database tables if they don't exist
                initializeTables();
            }
        });
        
        // Add database event handlers
        if (dbInstance) {
            dbInstance.on('error', (err) => {
                console.error('Database error:', err.message);
            });
            
            dbInstance.on('open', () => {
                console.log('Database connection opened');
            });
            
            dbInstance.on('close', () => {
                console.log('Database connection closed');
            });
        }
    }
    return dbInstance;
};

// Initialize database tables
function initializeTables() {
    const db = getDBConnection();
    
    console.log('Initializing database tables...');
    
    // Create tables if they don't exist
    const createTables = [
        `CREATE TABLE IF NOT EXISTS clientes (
            idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
            nomeCliente TEXT NOT NULL UNIQUE
        )`,
        `CREATE TABLE IF NOT EXISTS servicos (
            idServico INTEGER PRIMARY KEY AUTOINCREMENT,
            nomeServico TEXT NOT NULL,
            preco REAL NOT NULL,
            idCliente INTEGER NOT NULL,
            pagamento TEXT DEFAULT 'Dinheiro',
            data TEXT NOT NULL,
            statusServico INTEGER DEFAULT -1,
            statusPagamento INTEGER DEFAULT -1,
            notaFiscal TEXT,
            observacao TEXT,
            imagem_path TEXT,
            FOREIGN KEY (idCliente) REFERENCES clientes (idCliente)
        )`,
        `CREATE TABLE IF NOT EXISTS pedidos (
            idPedido INTEGER PRIMARY KEY AUTOINCREMENT,
            nomeMaterial TEXT NOT NULL,
            fornecedor TEXT,
            quantidade INTEGER DEFAULT 1,
            valor REAL DEFAULT 0,
            entregador TEXT,
            observacao TEXT,
            data TEXT NOT NULL
        )`
    ];
    
    createTables.forEach((sql, index) => {
        db.run(sql, (err) => {
            if (err) {
                console.error(`Erro ao criar tabela ${index + 1}:`, err.message);
            } else {
                console.log(`Tabela ${index + 1} criada/verificada com sucesso`);
            }
        });
    });
    
    // Verify tables were created
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('Error checking tables:', err.message);
        } else {
            console.log('Available tables:', tables.map(t => t.name).join(', '));
        }
    });
}

const consulta = async (sql, valores = [], mensagemReject) => {
    const db = getDBConnection();

    const runQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) {
                    console.error('Erro em runQuery:', err.message, 'SQL:', query, 'Params:', params);
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    };

    const allQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Erro em allQuery:', err.message, 'SQL:', query, 'Params:', params);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    try {
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            const selectParams = Array.isArray(valores) ? valores : (valores !== undefined ? [valores] : []);
            const rows = await allQuery(sql, selectParams);
            return rows;
        }

        let operationParams;
        if (Array.isArray(valores)) {
            operationParams = valores;
        } else if (typeof valores === 'object' && valores !== null) {
            operationParams = valores;
        } else if (valores !== undefined) {
            operationParams = [valores];
        } else {
            operationParams = [];
        }
        
        const operation = await runQuery(sql, operationParams);
        return operation;

    } catch (err) {
        console.error("Erro na consulta:", err.message, "SQL:", sql);
        throw new Error(mensagemReject || "Erro ao executar a consulta.");
    }
};

module.exports = {
    getDBConnection,
    consulta
};