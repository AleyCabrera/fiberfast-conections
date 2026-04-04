/**
 * Configuración del Dashboard
 */
const DASHBOARD_CONFIG = {
    // API endpoints
    API: {
        BASE_URL: 'https://api.fiberfast.com.co/v1',
        PAYMENTS: '/payments',
        SPEED_TEST: '/speed-test',
        TICKETS: '/support/tickets',
        NOTIFICATIONS: '/notifications'
    },
    
    // Tiempos de actualización (ms)
    REFRESH_INTERVALS: {
        SPEED: 30000,        // 30 segundos
        NOTIFICATIONS: 60000, // 1 minuto
        PAYMENTS: 300000      // 5 minutos
    },
    
    // Colores del tema
    THEME: {
        primary: '#4F528C',
        secondary: '#F2C53D',
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
        info: '#17A2B8'
    },
    
    // Mensajes predeterminados
    MESSAGES: {
        WELCOME: '¡Bienvenido a FiberFast!',
        SESSION_EXPIRED: 'Tu sesión ha expirado',
        PAYMENT_REMINDER: 'Recuerda pagar tu factura antes del {date}',
        SPEED_WARNING: 'Detectamos baja velocidad. ¿Quieres reiniciar el módem?'
    }
};

// No modificar - Freeze configuration
Object.freeze(DASHBOARD_CONFIG);