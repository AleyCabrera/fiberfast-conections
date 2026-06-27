// src/routes/solicitudes.routes.js
const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Ruta pública
router.post('/', solicitudesController.create);

// Rutas protegidas (admin)
router.get('/', authMiddleware, solicitudesController.getAll);
router.get('/stats', authMiddleware, solicitudesController.getStats);
router.put('/:id/estado', authMiddleware, solicitudesController.updateStatus);

module.exports = router;