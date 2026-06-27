// src/models/user.model.js
const { execute, isConnected } = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    /**
     * Crear un nuevo usuario
     * @param {Object} data - Datos del usuario
     * @param {string} data.nic - Número de identificación
     * @param {string} data.nombre - Nombre
     * @param {string} data.apellido - Apellido
     * @param {string} data.email - Correo electrónico
     * @param {string} data.password - Contraseña (sin hash)
     * @param {string} data.telefono - Teléfono (opcional)
     * @param {string} data.direccion - Dirección (opcional)
     * @param {string} data.tipo_cliente - 'residencial' o 'empresarial'
     * @returns {Promise<number>} - ID del usuario creado
     */
    async create({ nic, nombre, apellido, email, password, telefono = null, direccion = null, tipo_cliente = 'residencial' }) {
        // Validar campos obligatorios
        if (!nic || !nombre || !apellido || !email || !password) {
            throw new Error('Faltan campos obligatorios: nic, nombre, apellido, email, password');
        }

        if (!isConnected()) {
            // Modo memoria
            if (!global.usuarios) global.usuarios = [];
            
            // Verificar NIC duplicado
            if (global.usuarios.some(u => u.nic === nic)) {
                throw new Error('El NIC ya está registrado');
            }
            
            // Verificar email duplicado
            if (global.usuarios.some(u => u.email === email)) {
                throw new Error('El email ya está registrado');
            }

            const newUser = {
                id: global.usuarios.length + 1,
                nic,
                nombre,
                apellido,
                email,
                password_hash: await bcrypt.hash(password, 10),
                telefono,
                direccion,
                tipo_cliente,
                created_at: new Date().toISOString()
            };
            global.usuarios.push(newUser);
            return newUser.id;
        }

        // Verificar NIC duplicado en BD
        const [nicCheck] = await execute('SELECT id FROM clientes WHERE nic = ?', [nic]);
        if (nicCheck.length > 0) {
            throw new Error('El NIC ya está registrado');
        }

        // Verificar email duplicado en BD
        const [emailCheck] = await execute('SELECT id FROM clientes WHERE email = ?', [email]);
        if (emailCheck.length > 0) {
            throw new Error('El email ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await execute(
            `INSERT INTO clientes (nic, nombre, apellido, email, password_hash, telefono, direccion, tipo_cliente) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nic, nombre, apellido, email, hashedPassword, telefono, direccion, tipo_cliente]
        );
        return result.insertId;
    },

    /**
     * Buscar usuario por email
     */
    async findByEmail(email) {
        if (!isConnected()) {
            const user = global.usuarios?.find(u => u.email === email);
            return user || null;
        }

        const [rows] = await execute(
            `SELECT id, nic, nombre, apellido, email, password_hash, telefono, direccion, tipo_cliente, 
                    wishub_id, ultimo_login, created_at, updated_at 
             FROM clientes 
             WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    },

    /**
     * Buscar usuario por NIC
     */
    async findByNic(nic) {
        if (!isConnected()) {
            const user = global.usuarios?.find(u => u.nic === nic);
            return user || null;
        }

        const [rows] = await execute(
            `SELECT id, nic, nombre, apellido, email, password_hash, telefono, direccion, tipo_cliente, 
                    wishub_id, ultimo_login, created_at, updated_at 
             FROM clientes 
             WHERE nic = ?`,
            [nic]
        );
        return rows[0] || null;
    },

    /**
     * Buscar usuario por ID
     */
    async findById(id) {
        if (!isConnected()) {
            const user = global.usuarios?.find(u => u.id === id);
            return user || null;
        }

        const [rows] = await execute(
            `SELECT id, nic, nombre, apellido, email, telefono, direccion, tipo_cliente, wishub_id, 
                    ultimo_login, created_at, updated_at 
             FROM clientes 
             WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Actualizar usuario
     */
    async update(id, data) {
        if (!isConnected()) {
            const user = global.usuarios?.find(u => u.id === id);
            if (user) {
                Object.assign(user, data);
                return true;
            }
            return false;
        }

        const fields = [];
        const values = [];

        const allowedFields = ['nombre', 'apellido', 'telefono', 'direccion', 'tipo_cliente'];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        // Actualizar NIC (con validación de unicidad)
        if (data.nic !== undefined) {
            // Verificar que el NIC no esté en uso por otro usuario
            const [check] = await execute('SELECT id FROM clientes WHERE nic = ? AND id != ?', [data.nic, id]);
            if (check.length > 0) {
                throw new Error('El NIC ya está registrado por otro usuario');
            }
            fields.push('nic = ?');
            values.push(data.nic);
        }

        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            fields.push('password_hash = ?');
            values.push(hashedPassword);
        }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await execute(
            `UPDATE clientes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    /**
     * Actualizar último login
     */
    async updateLastLogin(id) {
        if (!isConnected()) return false;
        const [result] = await execute(
            'UPDATE clientes SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Contar total de usuarios
     */
    async countUsers() {
        if (!isConnected()) return 0;
        const [rows] = await execute('SELECT COUNT(*) as count FROM clientes');
        return rows[0]?.count || 0;
    },

    /**
     * Contar usuarios activos (con servicio activo)
     */
    async countActiveUsers() {
        if (!isConnected()) return 0;
        const [rows] = await execute(
            'SELECT COUNT(DISTINCT cliente_id) as count FROM servicios_contratados WHERE estado = "activo"'
        );
        return rows[0]?.count || 0;
    },

    /**
     * Buscar usuarios con filtros (para admin)
     */
    async findAll(filters = {}) {
        if (!isConnected()) {
            return global.usuarios || [];
        }

        let sql = 'SELECT id, nic, nombre, apellido, email, telefono, tipo_cliente, created_at, ultimo_login FROM clientes';
        const params = [];
        const conditions = [];

        if (filters.search) {
            conditions.push('(nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR nic LIKE ?)');
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.tipo) {
            conditions.push('tipo_cliente = ?');
            params.push(filters.tipo);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        if (filters.offset) {
            sql += ' OFFSET ?';
            params.push(parseInt(filters.offset));
        }

        const [rows] = await execute(sql, params);
        return rows;
    },

    /**
     * Eliminar usuario (soft delete)
     */
    async delete(id) {
        if (!isConnected()) {
            const index = global.usuarios?.findIndex(u => u.id === id);
            if (index !== -1) {
                global.usuarios.splice(index, 1);
                return true;
            }
            return false;
        }

        // Soft delete: marcar como inactivo o eliminar registros relacionados
        // Por ahora, eliminamos físicamente (cuidado con relaciones)
        const [result] = await execute('DELETE FROM clientes WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = User;