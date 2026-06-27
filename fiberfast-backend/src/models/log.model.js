// src/models/log.model.js
const { execute, isConnected } = require('../config/db');

const Log = {
    async create(data) {
        if (!isConnected()) {
            if (!global.logs) global.logs = [];
            global.logs.push({
                id: global.logs.length + 1,
                ...data,
                created_at: new Date().toISOString()
            });
            return true;
        }

        try {
            await execute(
                `INSERT INTO auth_logs 
                 (usuario_id, email, evento, ip, user_agent, resultado, detalles) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.usuario_id || null,
                    data.email || 'unknown',
                    data.evento || 'unknown',
                    data.ip || null,
                    data.user_agent || null,
                    data.resultado || 'success',
                    data.detalles || null
                ]
            );
            return true;
        } catch (error) {
            console.error('❌ Error registrando log:', error.message);
            return false;
        }
    },

    async findByUser(usuarioId, limit = 50) {
        if (!isConnected()) return [];

        try {
            const [rows] = await execute(
                `SELECT evento, ip, user_agent, resultado, detalles, created_at 
                 FROM auth_logs 
                 WHERE usuario_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [usuarioId, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            return [];
        }
    },

    async getStats(days = 7) {
        if (!isConnected()) return [];

        try {
            const [rows] = await execute(
                `SELECT 
                    evento,
                    COUNT(*) as total,
                    DATE(created_at) as fecha
                 FROM auth_logs 
                 WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                 GROUP BY evento, DATE(created_at)
                 ORDER BY fecha DESC, evento`,
                [days]
            );
            return rows;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return [];
        }
    }
};

module.exports = Log;