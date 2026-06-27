// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const planesRoutes = require('./planes.routes');
const solicitudesRoutes = require('./solicitudes.routes');
const ticketsRoutes = require('./tickets.routes');
const adminRoutes = require('./admin.routes');

router.get('/', (req, res) => {
    res.json({
        name: 'FiberFast API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            planes: '/api/planes',
            solicitudes: '/api/solicitudes',
            tickets: '/api/tickets',
            admin: '/api/admin',
            health: '/api/health'
        },
        documentation: 'https://fiberfast.com.co/docs'
    });
});

router.use('/auth', authRoutes);
router.use('/planes', planesRoutes);
router.use('/solicitudes', solicitudesRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;