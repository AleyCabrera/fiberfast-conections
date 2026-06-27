// src/controllers/tickets.controller.js
const Ticket = require('../models/ticket.model');

const ticketsController = {
    // Crear nuevo ticket
    create: async (req, res) => {
        try {
            const { nombre, email, telefono, tipo, prioridad, asunto, descripcion } = req.body;
            const cliente_id = req.user?.userId || null;

            // Si el usuario está autenticado, usar sus datos
        let nombreFinal = nombre;
        let emailFinal = email;
        
            if (req.user && !nombre) {
                // Si el usuario está autenticado pero no envió nombre/email, usar los del perfil
                const user = await User.findById(req.user.userId);
                if (user) {
                    nombreFinal = user.nombre;
                    emailFinal = user.email;
                }
            }
            
            // Validación básica
            if (!nombre || !email || !asunto || !descripcion) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre, email, asunto y descripción son obligatorios'
                });
            }

            const ticketId = await Ticket.create({
                cliente_id,
                nombre: nombreFinal,
                email: emailFinal,
                telefono: telefono || null,
                tipo: tipo || 'otros',
                prioridad: prioridad || 'normal',
                asunto,
                descripcion
            });

            res.status(201).json({
                success: true,
                message: 'Ticket creado correctamente',
                ticketId
            });
        } catch (error) {
            console.error('❌ Error creando ticket:', error);
            res.status(500).json({
                success: false,
                error: 'Error al crear el ticket'
            });
        }

        await Log.create({
            usuario_id: req.user?.userId || null,
            email: emailFinal,
            evento: 'ticket_creado',
            ip: getClientIp(req),
            user_agent: req.headers['user-agent'],
            resultado: 'success',
            detalles: `Ticket #${ticketId} creado: ${asunto}`
        });
    },

    // Obtener tickets del usuario autenticado
    getMyTickets: async (req, res) => {
        try {
            const { estado, limit } = req.query;
            const tickets = await Ticket.findByUser(req.user.userId, { estado, limit });
            res.json({
                success: true,
                count: tickets.length,
                tickets
            });
        } catch (error) {
            console.error('❌ Error obteniendo tickets:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener los tickets'
            });
        }
    },

    // Obtener todos los tickets (admin)
    getAll: async (req, res) => {
        try {
            const { estado, prioridad, limit } = req.query;
            const tickets = await Ticket.findAll({ estado, prioridad, limit });
            res.json({
                success: true,
                count: tickets.length,
                tickets
            });
        } catch (error) {
            console.error('❌ Error obteniendo tickets:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener los tickets'
            });
        }
    },

    // Obtener detalle de un ticket
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const ticket = await Ticket.findById(parseInt(id));

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket no encontrado'
                });
            }

            // Verificar permisos: admin, propietario, o ticket sin cliente (público)
            const isAdmin = req.user.role === 'admin';
            const isOwner = req.user.userId === ticket.cliente_id;
            const isPublic = ticket.cliente_id === null;

            if (!isAdmin && !isOwner && !isPublic) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permiso para ver este ticket'
                });
            }

            const respuestas = await Ticket.getReplies(parseInt(id));
            res.json({
                success: true,
                ticket,
                respuestas
            });
        } catch (error) {
            console.error('❌ Error obteniendo ticket:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener el ticket'
            });
        }
    },

    // Actualizar ticket (admin)
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado, prioridad, asignado_a } = req.body;

            const ticket = await Ticket.findById(parseInt(id));
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket no encontrado'
                });
            }

            const updated = await Ticket.update(parseInt(id), { estado, prioridad, asignado_a });
            if (!updated) {
                return res.status(400).json({
                    success: false,
                    error: 'No se pudo actualizar el ticket'
                });
            }

            res.json({
                success: true,
                message: 'Ticket actualizado correctamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando ticket:', error);
            res.status(500).json({
                success: false,
                error: 'Error al actualizar el ticket'
            });
        }
    },

    // Agregar respuesta a ticket
    addReply: async (req, res) => {
        try {
            const { id } = req.params;
            const { mensaje, es_interno } = req.body;

            if (!mensaje) {
                return res.status(400).json({
                    success: false,
                    error: 'El mensaje es obligatorio'
                });
            }

            const ticket = await Ticket.findById(parseInt(id));
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket no encontrado'
                });
            }

            const added = await Ticket.addReply(
                parseInt(id),
                req.user.userId,
                req.user.nombre || 'Usuario',
                mensaje,
                es_interno || false
            );

            if (!added) {
                return res.status(400).json({
                    success: false,
                    error: 'No se pudo agregar la respuesta'
                });
            }

            // Si el ticket estaba abierto y se agrega respuesta, actualizar estado a en_proceso
            if (ticket.estado === 'abierto') {
                await Ticket.update(parseInt(id), { estado: 'en_proceso' });
            }

            res.json({
                success: true,
                message: 'Respuesta agregada correctamente'
            });
        } catch (error) {
            console.error('❌ Error agregando respuesta:', error);
            res.status(500).json({
                success: false,
                error: 'Error al agregar la respuesta'
            });
        }
    },

    // Obtener estadísticas de tickets (admin)
    getStats: async (req, res) => {
        try {
            const total = await Ticket.countByStatus();
            const abiertos = await Ticket.countByStatus('abierto');
            const en_proceso = await Ticket.countByStatus('en_proceso');
            const resueltos = await Ticket.countByStatus('resuelto');
            const cerrados = await Ticket.countByStatus('cerrado');

            res.json({
                success: true,
                stats: {
                    total,
                    abiertos,
                    en_proceso,
                    resueltos,
                    cerrados
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

module.exports = ticketsController;