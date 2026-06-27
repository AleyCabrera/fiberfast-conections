// src/models/ticket.model.js
const { execute, isConnected } = require('../config/db');

const Ticket = {
    async create(data) {
        if (!isConnected()) {
            if (!global.tickets) global.tickets = [];
            const newTicket = {
                id: global.tickets.length + 1,
                ...data,
                estado: 'abierto',
                created_at: new Date().toISOString()
            };
            global.tickets.push(newTicket);
            return newTicket.id;
        }

        const [result] = await execute(
            `INSERT INTO tickets 
             (cliente_id, nombre, email, telefono, tipo, prioridad, asunto, descripcion) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.cliente_id || null,
                data.nombre,
                data.email,
                data.telefono || null,
                data.tipo || 'otros',
                data.prioridad || 'normal',
                data.asunto,
                data.descripcion
            ]
        );
        return result.insertId;
    },

    async findByUser(clienteId, filters = {}) {
        if (!isConnected()) {
            return global.tickets?.filter(t => t.cliente_id === clienteId) || [];
        }

        let sql = 'SELECT * FROM tickets WHERE cliente_id = ?';
        const params = [clienteId];

        if (filters.estado) {
            sql += ' AND estado = ?';
            params.push(filters.estado);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await execute(sql, params);
        return rows;
    },

    async findAll(filters = {}) {
        if (!isConnected()) {
            return global.tickets || [];
        }

        let sql = 'SELECT * FROM tickets';
        const params = [];

        const conditions = [];
        if (filters.estado) {
            conditions.push('estado = ?');
            params.push(filters.estado);
        }
        if (filters.prioridad) {
            conditions.push('prioridad = ?');
            params.push(filters.prioridad);
        }
        if (filters.email) {
            conditions.push('email = ?');
            params.push(filters.email);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await execute(sql, params);
        return rows;
    },

    async findById(id) {
        if (!isConnected()) {
            return global.tickets?.find(t => t.id === id) || null;
        }

        const [rows] = await execute('SELECT * FROM tickets WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async update(id, data) {
        if (!isConnected()) {
            const ticket = global.tickets?.find(t => t.id === id);
            if (ticket) {
                Object.assign(ticket, data);
                return true;
            }
            return false;
        }

        const fields = [];
        const values = [];

        if (data.estado !== undefined) {
            fields.push('estado = ?');
            values.push(data.estado);
            if (data.estado === 'cerrado' || data.estado === 'resuelto') {
                fields.push('fecha_cierre = CURRENT_TIMESTAMP');
            }
        }
        if (data.prioridad !== undefined) {
            fields.push('prioridad = ?');
            values.push(data.prioridad);
        }
        if (data.asignado_a !== undefined) {
            fields.push('asignado_a = ?');
            values.push(data.asignado_a);
        }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await execute(
            `UPDATE tickets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async addReply(ticketId, usuarioId, autor, mensaje, esInterno = false) {
        if (!isConnected()) return false;

        const [result] = await execute(
            `INSERT INTO ticket_respuestas (ticket_id, usuario_id, autor, mensaje, es_interno) 
             VALUES (?, ?, ?, ?, ?)`,
            [ticketId, usuarioId || null, autor, mensaje, esInterno]
        );

        if (result.affectedRows > 0) {
            // Actualizar la fecha del ticket
            await execute(
                'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [ticketId]
            );
            return true;
        }
        return false;
    },

    async getReplies(ticketId) {
        if (!isConnected()) return [];

        const [rows] = await execute(
            `SELECT * FROM ticket_respuestas WHERE ticket_id = ? ORDER BY created_at ASC`,
            [ticketId]
        );
        return rows;
    },

    async countByStatus(estado = null) {
        if (!isConnected()) return 0;

        let sql = 'SELECT COUNT(*) as count FROM tickets';
        const params = [];

        if (estado) {
            sql += ' WHERE estado = ?';
            params.push(estado);
        }

        const [rows] = await execute(sql, params);
        return rows[0]?.count || 0;
    }
};

module.exports = Ticket;