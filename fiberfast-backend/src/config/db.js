// src/config/db.js - Configuración de base de datos
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isDatabaseConnected = false;

// Verificar configuración
const hasDbConfig = process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME;

// Inicializar pool de conexiones
const initDatabase = async () => {
    if (!hasDbConfig) {
        console.log('⚠️  Base de datos no configurada. Usando modo memoria.');
        console.log('💡 Para configurar MySQL, agrega las variables DB_* en .env');
        return null;
    }

    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            timezone: '+00:00'
        });

        // Probar conexión
        const connection = await pool.getConnection();
        connection.release();
        isDatabaseConnected = true;
        console.log('✅ Conexión a MySQL establecida correctamente');
        return pool;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        console.log('⚠️  Continuando en modo memoria...');
        return null;
    }
};

// Obtener pool de conexiones
const getPool = () => {
    if (!isDatabaseConnected || !pool) {
        console.warn('⚠️  Usando modo memoria - las operaciones no persistirán');
        return null;
    }
    return pool;
};

// Ejecutar queries con manejo de errores
const execute = async (sql, params = []) => {
    if (!isDatabaseConnected || !pool) {
        console.log('📝 [MODO MEMORIA] Query:', sql);
        console.log('📝 Parámetros:', params);
        return [[], null];
    }

    try {
        const safeParams = Array.isArray(params) ? params.map(p => p === undefined ? null : p) : [];
        return await pool.execute(sql, safeParams);
    } catch (error) {
        console.error('❌ Error en execute:', error.message);
        throw error;
    }
};

// Inicializar inmediatamente
initDatabase();

module.exports = {
    pool: getPool,
    execute,
    isConnected: () => isDatabaseConnected,
    init: initDatabase,
    closeConnection: async () => {
        if (pool) {
            await pool.end();
            isDatabaseConnected = false;
            console.log('✅ Conexión a MySQL cerrada');
        }
    }
};