// src/routes/tickets.routes.js
const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/tickets.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Ruta pública para crear ticket
router.post('/', ticketsController.create);

// Rutas protegidas
router.get('/mis-tickets', authMiddleware, ticketsController.getMyTickets);
router.get('/admin', authMiddleware, ticketsController.getAll);
router.get('/admin/stats', authMiddleware, ticketsController.getStats);
router.get('/:id', authMiddleware, ticketsController.getById);
router.put('/:id', authMiddleware, ticketsController.update);
router.post('/:id/respuesta', authMiddleware, ticketsController.addReply);

module.exports = router;