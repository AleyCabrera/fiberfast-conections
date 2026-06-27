// src/middlewares/error.middleware.js
require('dotenv').config();

const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);

    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message;

    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    notFound,
    errorHandler
};