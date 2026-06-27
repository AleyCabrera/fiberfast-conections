// src/models/solicitud.model.js
const { execute, isConnected } = require('../config/db');

const Solicitud = {
    async create(data) {
        if (!isConnected()) {
            if (!global.solicitudes) global.solicitudes = [];
            const newSolicitud = {
                id: global.solicitudes.length + 1,
                ...data,
                estado: 'pendiente',
                created_at: new Date().toISOString()
            };
            global.solicitudes.push(newSolicitud);
            return newSolicitud.id;
        }

        const [result] = await execute(
            `INSERT INTO solicitudes_contacto 
             (nombre, email, telefono, plan_interes, direccion, mensaje, origen, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.nombre,
                data.email,
                data.telefono,
                data.plan_interes || null,
                data.direccion || null,
                data.mensaje || null,
                data.origen || 'landing',
                'pendiente'
            ]
        );
        return result.insertId;
    },

    async findAll(filters = {}) {
        if (!isConnected()) {
            return global.solicitudes || [];
        }

        let sql = 'SELECT * FROM solicitudes_contacto';
        const params = [];

        const conditions = [];
        if (filters.estado) {
            conditions.push('estado = ?');
            params.push(filters.estado);
        }
        if (filters.email) {
            conditions.push('email = ?');
            params.push(filters.email);
        }
        if (filters.origen) {
            conditions.push('origen = ?');
            params.push(filters.origen);
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
            return global.solicitudes?.find(s => s.id === id) || null;
        }

        const [rows] = await execute('SELECT * FROM solicitudes_contacto WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async updateStatus(id, estado, notas = null) {
        if (!isConnected()) {
            const solicitud = global.solicitudes?.find(s => s.id === id);
            if (solicitud) {
                solicitud.estado = estado;
                if (notas) solicitud.notas = notas;
                if (estado === 'contactado') solicitud.fecha_contacto = new Date().toISOString();
                return true;
            }
            return false;
        }

        const fields = ['estado = ?'];
        const values = [estado];

        if (notas) {
            fields.push('notas = ?');
            values.push(notas);
        }

        if (estado === 'contactado') {
            fields.push('fecha_contacto = CURRENT_TIMESTAMP');
        }

        values.push(id);
        const [result] = await execute(
            `UPDATE solicitudes_contacto SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async countByStatus(estado = null) {
        if (!isConnected()) return 0;

        let sql = 'SELECT COUNT(*) as count FROM solicitudes_contacto';
        const params = [];

        if (estado) {
            sql += ' WHERE estado = ?';
            params.push(estado);
        }

        const [rows] = await execute(sql, params);
        return rows[0]?.count || 0;
    }
};

module.exports = Solicitud;