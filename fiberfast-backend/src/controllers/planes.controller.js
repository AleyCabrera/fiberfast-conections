// src/controllers/planes.controller.js
const Plan = require('../models/plan.model');

const planesController = {
    // Obtener todos los planes
    getAll: async (req, res) => {
        try {
            const { tipo, limit } = req.query;
            const planes = await Plan.findAll({ tipo, limit });
            
            // Verificar si hay error en la respuesta
            if (!planes) {
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener los planes'
                });
            }
            
            res.json({
                success: true,
                count: planes.length,
                planes
            });
        } catch (error) {
            console.error('❌ Error en getAll Planes:', error);
            // Mostrar más detalles del error
            res.status(500).json({
                success: false,
                error: 'Error al obtener los planes',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Obtener un plan por ID
    getById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const plan = await Plan.findById(id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan no encontrado'
                });
            }

            res.json({
                success: true,
                plan
            });
        } catch (error) {
            console.error('❌ Error en getById Plan:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener el plan',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Obtener planes por categoría
    getByType: async (req, res) => {
        try {
            const { tipo } = req.params;

            if (tipo !== 'residencial' && tipo !== 'empresarial') {
                return res.status(400).json({
                    success: false,
                    error: 'Tipo inválido. Use "residencial" o "empresarial"'
                });
            }

            const planes = await Plan.findByType(tipo);
            res.json({
                success: true,
                count: planes.length,
                tipo,
                planes
            });
        } catch (error) {
            console.error('❌ Error en getByType Plan:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener los planes',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = planesController;