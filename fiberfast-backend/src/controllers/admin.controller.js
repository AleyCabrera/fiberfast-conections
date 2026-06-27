// src/controllers/admin.controller.js
const User = require('../models/user.model');
const Plan = require('../models/plan.model');
const Solicitud = require('../models/solicitud.model');
const Ticket = require('../models/ticket.model');
const { isConnected } = require('../config/db');

const adminController = {
    // Dashboard stats
    getStats: async (req, res) => {
        try {
            const totalUsers = await User.countUsers();
            const activeUsers = await User.countActiveUsers();
            const totalSolicitudes = await Solicitud.countByStatus();
            const solicitudesPendientes = await Solicitud.countByStatus('pendiente');
            const totalTickets = await Ticket.countByStatus();
            const ticketsAbiertos = await Ticket.countByStatus('abierto');

            res.json({
                success: true,
                stats: {
                    usuarios: {
                        total: totalUsers,
                        activos: activeUsers
                    },
                    solicitudes: {
                        total: totalSolicitudes,
                        pendientes: solicitudesPendientes
                    },
                    tickets: {
                        total: totalTickets,
                        abiertos: ticketsAbiertos
                    },
                    database: isConnected() ? 'mysql' : 'memory',
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener estadísticas del dashboard'
            });
        }
    },

    // Obtener todos los planes (incluyendo inactivos para admin)
    getAllPlanes: async (req, res) => {
        try {
            const planes = await Plan.findAll({});
            res.json({
                success: true,
                count: planes.length,
                planes
            });
        } catch (error) {
            console.error('❌ Error obteniendo planes:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener los planes'
            });
        }
    },

    // Crear nuevo plan (admin)
    createPlan: async (req, res) => {
        try {
            const { nombre, velocidad, precio, tipo, caracteristicas, popular } = req.body;

            if (!nombre || !velocidad || !precio || !tipo) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre, velocidad, precio y tipo son obligatorios'
                });
            }

            const planId = await Plan.create({
                nombre,
                velocidad: parseInt(velocidad),
                precio: parseFloat(precio),
                tipo,
                caracteristicas: caracteristicas || [],
                popular: popular || false
            });

            res.status(201).json({
                success: true,
                message: 'Plan creado correctamente',
                planId
            });
        } catch (error) {
            console.error('❌ Error creando plan:', error);
            res.status(500).json({
                success: false,
                error: 'Error al crear el plan'
            });
        }
    },

    // Actualizar plan (admin)
    updatePlan: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, velocidad, precio, tipo, caracteristicas, popular, activo } = req.body;

            const updated = await Plan.update(parseInt(id), {
                nombre,
                velocidad: velocidad ? parseInt(velocidad) : undefined,
                precio: precio ? parseFloat(precio) : undefined,
                tipo,
                caracteristicas,
                popular,
                activo
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan no encontrado o no se pudo actualizar'
                });
            }

            res.json({
                success: true,
                message: 'Plan actualizado correctamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando plan:', error);
            res.status(500).json({
                success: false,
                error: 'Error al actualizar el plan'
            });
        }
    },

    // Eliminar plan (admin)
    deletePlan: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await Plan.update(parseInt(id), { activo: false });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Plan desactivado correctamente'
            });
        } catch (error) {
            console.error('❌ Error eliminando plan:', error);
            res.status(500).json({
                success: false,
                error: 'Error al eliminar el plan'
            });
        }
    },

    // Obtener todos los usuarios (admin)
    getAllUsers: async (req, res) => {
        try {
            const { execute } = require('../config/db');
            const [rows] = await execute(
                'SELECT id, nombre, email, telefono, tipo_cliente, created_at, ultimo_login FROM clientes ORDER BY created_at DESC'
            );
            res.json({
                success: true,
                count: rows.length,
                usuarios: rows
            });
        } catch (error) {
            console.error('❌ Error obteniendo usuarios:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener los usuarios'
            });
        }
    },

    // Obtener logs del sistema (admin)
    getLogs: async (req, res) => {
        try {
            const { execute } = require('../config/db');
            const { limit, evento } = req.query;

            // Verificar si la tabla existe
            try {
                const [tableCheck] = await execute(
                    "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'auth_logs'"
                );
                
                if (tableCheck[0].count === 0) {
                    return res.json({
                        success: true,
                        count: 0,
                        logs: [],
                        message: 'Tabla de logs aún no tiene datos'
                    });
                }
            } catch (tableError) {
                // Si la tabla no existe, devolver array vacío
                return res.json({
                    success: true,
                    count: 0,
                    logs: [],
                    message: 'Logs no disponibles'
                });
            }

            let sql = 'SELECT * FROM auth_logs';
            const params = [];

            if (evento) {
                sql += ' WHERE evento = ?';
                params.push(evento);
            }

            sql += ' ORDER BY created_at DESC';

            if (limit) {
                sql += ' LIMIT ?';
                params.push(parseInt(limit));
            }

            const [rows] = await execute(sql, params);
            res.json({
                success: true,
                count: rows.length,
                logs: rows
            });
        } catch (error) {
            console.error('❌ Error obteniendo logs:', error);
            // En lugar de error 500, devolver array vacío
            res.json({
                success: true,
                count: 0,
                logs: [],
                message: 'Error al obtener logs, pero continuando'
            });
        }
    }
};

module.exports = adminController;