// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Log = require('../models/log.model');
const { isConnected } = require('../config/db');

const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        '0.0.0.0';
};

const authController = {
    // Registrar nuevo usuario
    register: async (req, res) => {
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'];

        try {
            const { nic, nombre, apellido, email, password, telefono, direccion, tipo_cliente } = req.body;

            console.log('📝 Registrando usuario:', { nic, nombre, apellido, email });

            // Validar campos obligatorios
            if (!nic || !nombre || !apellido || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios: nic, nombre, apellido, email, password'
                });
            }

            // Crear usuario
            const userId = await User.create({
                nic,
                nombre,
                apellido,
                email: email.toLowerCase().trim(),
                password,
                telefono: telefono || null,
                direccion: direccion || null,
                tipo_cliente: tipo_cliente || 'residencial'
            });

            // Log de registro exitoso
            await Log.create({
                usuario_id: userId,
                email,
                evento: 'registro_exitoso',
                ip: clientIp,
                user_agent: userAgent,
                resultado: 'success',
                detalles: `Usuario ${nombre} ${apellido} registrado con NIC ${nic}`
            });

            // Generar token JWT
            const token = jwt.sign(
                { userId, email, nombre: `${nombre} ${apellido}` },
                process.env.JWT_SECRET || 'fiberfast-secret-key-2024',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                user: {
                    id: userId,
                    nic,
                    nombre,
                    apellido,
                    email,
                    tipo_cliente: tipo_cliente || 'residencial'
                },
                token,
                database: isConnected() ? 'mysql' : 'memory'
            });

        } catch (error) {
            console.error('❌ Error en registro:', error);
            
            // Manejar errores específicos
            let message = 'Error interno del servidor';
            if (error.message.includes('NIC')) {
                message = 'El NIC ya está registrado';
            } else if (error.message.includes('email')) {
                message = 'El email ya está registrado';
            } else {
                message = error.message;
            }

            await Log.create({
                email: req.body.email || 'unknown',
                evento: 'registro_error',
                ip: clientIp,
                user_agent: userAgent,
                resultado: 'error',
                detalles: error.message
            });

            res.status(500).json({
                success: false,
                message,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Iniciar sesión
    login: async (req, res) => {
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'];
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);

            if (!user) {
                await Log.create({
                    email,
                    evento: 'login_fallido',
                    ip: clientIp,
                    user_agent: userAgent,
                    resultado: 'failed',
                    detalles: 'Usuario no encontrado'
                });
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            // Verificar contraseña
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                await Log.create({
                    usuario_id: user.id,
                    email,
                    evento: 'login_fallido',
                    ip: clientIp,
                    user_agent: userAgent,
                    resultado: 'failed',
                    detalles: 'Contraseña incorrecta'
                });
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            // Actualizar último login
            await User.updateLastLogin(user.id);

            // Log de login exitoso
            await Log.create({
                usuario_id: user.id,
                email,
                evento: 'login_exitoso',
                ip: clientIp,
                user_agent: userAgent,
                resultado: 'success',
                detalles: `Login exitoso desde ${clientIp}`
            });

            // Generar token JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email, nombre: user.nombre },
                process.env.JWT_SECRET || 'fiberfast-secret-key-2024',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    tipo_cliente: user.tipo_cliente
                },
                database: isConnected() ? 'mysql' : 'memory'
            });

        } catch (error) {
            console.error('❌ Error en login:', error);
            await Log.create({
                email,
                evento: 'login_error',
                ip: clientIp,
                user_agent: userAgent,
                resultado: 'error',
                detalles: error.message
            });
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener perfil del usuario autenticado
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json({
                success: true,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    tipo_cliente: user.tipo_cliente,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo perfil:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Actualizar perfil
    updateProfile: async (req, res) => {
        try {
            const { nombre, telefono, direccion, tipo_cliente } = req.body;
            const userId = req.user.userId;

            const updated = await User.update(userId, {
                nombre,
                telefono,
                direccion,
                tipo_cliente
            });

            if (!updated) {
                return res.status(400).json({ message: 'No se pudo actualizar el perfil' });
            }

            res.json({
                success: true,
                message: 'Perfil actualizado correctamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Cambiar contraseña
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Verificar contraseña actual (solo si hay BD)
            if (isConnected()) {
                const userWithPassword = await User.findByEmail(user.email);
                const validPassword = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
                if (!validPassword) {
                    return res.status(401).json({ message: 'Contraseña actual incorrecta' });
                }
            }

            await User.update(userId, { password: newPassword });

            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });
        } catch (error) {
            console.error('❌ Error cambiando contraseña:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener logs del usuario
    getMyLogs: async (req, res) => {
        try {
            const logs = await Log.findByUser(req.user.userId, 50);
            res.json({
                success: true,
                logs,
                count: logs.length
            });
        } catch (error) {
            console.error('❌ Error obteniendo logs:', error);
            res.status(500).json({
                message: 'Error al obtener logs',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = authController;