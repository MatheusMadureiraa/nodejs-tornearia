const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Get the correct database path for both development and production
function getDatabasePath() {
    if (process.env.NODE_ENV === 'production' || process.pkg) {
        // In production, store database in user data directory
        const { app } = require('electron');
        const userDataPath = app ? app.getPath('userData') : path.join(require('os').homedir(), 'vallim-tornearia');
        
        // Ensure directory exists
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        
        return path.join(userDataPath, 'tornearia.db');
    } else {
        // In development, use local path
        return process.env.DB_PATH || path.resolve(__dirname, 'tornearia.db');
    }
}

const dbPath = getDatabasePath();
console.log('📁 Database path:', dbPath);

let dbInstance = null;

const getDBConnection = () => {
    if (!dbInstance) {
        dbInstance = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err.message);
            } else {
                console.log('Conectado ao banco de dados SQLite.');
                console.log('📁 Database location:', dbPath);
            }
        });
    }
    return dbInstance;
};

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