// src/utils/response.util.js

const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

const errorResponse = (res, message, statusCode = 500, details = null) => {
    const response = {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    };

    if (details && process.env.NODE_ENV !== 'production') {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, page, limit, total, message = 'Operación exitosa') => {
    return res.json({
        success: true,
        message,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse
};