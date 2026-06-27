// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas de admin requieren autenticación
router.use(authMiddleware);

router.get('/stats', adminController.getStats);
router.get('/planes', adminController.getAllPlanes);
router.post('/planes', adminController.createPlan);
router.put('/planes/:id', adminController.updatePlan);
router.delete('/planes/:id', adminController.deletePlan);
router.get('/usuarios', adminController.getAllUsers);
router.get('/logs', adminController.getLogs);

module.exports = router;