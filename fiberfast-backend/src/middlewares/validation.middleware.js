// src/middlewares/validation.middleware.js
const { body, validationResult } = require('express-validator');

// Middleware para verificar resultados de validación
const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array()
        });
    }
    next();
};

// Validación de registro
const validateRegister = [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .trim()
        .escape()
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/)
        .withMessage('La contraseña debe contener mayúscula, minúscula, número y carácter especial'),

    body('telefono')
        .optional()
        .isMobilePhone('es-CO').withMessage('Debe proporcionar un número de teléfono colombiano válido')
        .trim(),

    body('direccion')
        .optional()
        .isLength({ max: 200 }).withMessage('La dirección no puede exceder los 200 caracteres')
        .trim()
        .escape(),

    validateResult
];

// Validación de login
const validateLogin = [
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),

    validateResult
];

// Validación de solicitud de contacto
const validateSolicitud = [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .trim()
        .escape(),

    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),

    body('telefono')
        .notEmpty().withMessage('El teléfono es requerido')
        .isMobilePhone('es-CO').withMessage('Debe proporcionar un número de teléfono colombiano válido')
        .trim(),

    body('plan_interes')
        .optional()
        .isLength({ max: 100 }).withMessage('El plan de interés no puede exceder los 100 caracteres')
        .trim()
        .escape(),

    body('direccion')
        .optional()
        .isLength({ max: 200 }).withMessage('La dirección no puede exceder los 200 caracteres')
        .trim()
        .escape(),

    body('mensaje')
        .optional()
        .isLength({ max: 500 }).withMessage('El mensaje no puede exceder los 500 caracteres')
        .trim()
        .escape(),

    validateResult
];

// Validación de ticket
const validateTicket = [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .trim()
        .escape(),

    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),

    body('asunto')
        .notEmpty().withMessage('El asunto es requerido')
        .isLength({ min: 3, max: 200 }).withMessage('El asunto debe tener entre 3 y 200 caracteres')
        .trim()
        .escape(),

    body('descripcion')
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 10, max: 5000 }).withMessage('La descripción debe tener entre 10 y 5000 caracteres')
        .trim()
        .escape(),

    body('telefono')
        .optional()
        .isMobilePhone('es-CO').withMessage('Debe proporcionar un número de teléfono colombiano válido')
        .trim(),

    body('tipo')
        .optional()
        .isIn(['tecnico', 'facturacion', 'instalacion', 'velocidad', 'cortes', 'otros'])
        .withMessage('Tipo de ticket inválido'),

    body('prioridad')
        .optional()
        .isIn(['baja', 'normal', 'alta', 'urgente'])
        .withMessage('Prioridad inválida'),

    validateResult
];

module.exports = {
    validateRegister,
    validateLogin,
    validateSolicitud,
    validateTicket
};