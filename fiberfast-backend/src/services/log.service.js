// src/services/log.service.js
const Log = require('../models/log.model');

class LogService {
    async logAuthEvent(data) {
        return await Log.create(data);
    }

    async getUserLogs(usuarioId, limit = 50) {
        return await Log.findByUser(usuarioId, limit);
    }

    async getStats(days = 7) {
        return await Log.getStats(days);
    }
}

module.exports = new LogService();