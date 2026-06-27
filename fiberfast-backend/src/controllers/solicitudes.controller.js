// src/controllers/solicitudes.controller.js
const Solicitud = require('../models/solicitud.model');

const solicitudesController = {
    // Crear nueva solicitud
    create: async (req, res) => {
        try {
            const { nombre, email, telefono, plan_interes, direccion, mensaje, origen } = req.body;

            // Validación básica
            if (!nombre || !email || !telefono) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre, email y teléfono son obligatorios'
                });
            }

            const solicitudId = await Solicitud.create({
                nombre,
                email,
                telefono,
                plan_interes,
                direccion,
                mensaje,
                origen: origen || 'landing'
            });

            res.status(201).json({
                success: true,
                message: 'Solicitud enviada correctamente',
                solicitudId
            });
        } catch (error) {
            console.error('❌ Error creando solicitud:', error);
            res.status(500).json({
                success: false,
                error: 'Error al enviar la solicitud'
            });
        }
    },

    // Obtener todas las solicitudes (admin)
    getAll: async (req, res) => {
        try {
            const { estado, limit } = req.query;
            const solicitudes = await Solicitud.findAll({ estado, limit });
            res.json({
                success: true,
                count: solicitudes.length,
                solicitudes
            });
        } catch (error) {
            console.error('❌ Error obteniendo solicitudes:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener las solicitudes'
            });
        }
    },

    // Actualizar estado de solicitud (admin)
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado, notas } = req.body;

            if (!['pendiente', 'contactado', 'convertido', 'descartado'].includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado inválido'
                });
            }

            const updated = await Solicitud.updateStatus(parseInt(id), estado, notas);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: 'Solicitud no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Estado actualizado correctamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando solicitud:', error);
            res.status(500).json({
                success: false,
                error: 'Error al actualizar la solicitud'
            });
        }
    },

    // Obtener estadísticas de solicitudes (admin)
    getStats: async (req, res) => {
        try {
            const total = await Solicitud.countByStatus();
            const pendientes = await Solicitud.countByStatus('pendiente');
            const contactados = await Solicitud.countByStatus('contactado');
            const convertidos = await Solicitud.countByStatus('convertido');
            const descartados = await Solicitud.countByStatus('descartado');

            res.json({
                success: true,
                stats: {
                    total,
                    pendientes,
                    contactados,
                    convertidos,
                    descartados
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener estadísticas'
            });
        }
    }
};

module.exports = solicitudesController;