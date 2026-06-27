// src/app.js - Configuración de Express
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad con Helmet
app.use(helmet());

// Configuración CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.CORS_ORIGIN || 'https://fiberfast.com.co']
        : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutos
};

app.use(cors(corsOptions));

// Logger en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { error: 'Demasiadas peticiones, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

// Parseo de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RUTAS DE HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    const { isConnected } = require('./config/db');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: isConnected() ? 'connected' : 'memory_mode',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'FiberFast API',
        version: '1.0.0',
        status: 'online',
        documentation: '/api/docs',
        endpoints: {
            health: '/api/health',
            api: '/api',
            auth: '/api/auth',
            planes: '/api/planes',
            solicitudes: '/api/solicitudes',
            tickets: '/api/tickets',
            admin: '/api/admin'
        }
    });
});

// ============================================
// RUTAS DE LA API
// ============================================

app.use('/api', routes);

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use(notFound);
app.use(errorHandler);

module.exports = app;