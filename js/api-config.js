/**
 * Configuración de la API para FiberFast
 * Centraliza todas las URLs y métodos de comunicación con el backend
 */

const API_CONFIG = {
    // URL base del backend
    BASE_URL: 'http://localhost:3000/api',
    
    // Endpoints de autenticación
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password',
        LOGS: '/auth/logs'
    },
    
    // Endpoints de planes
    PLANES: {
        LIST: '/planes',
        BY_TYPE: (tipo) => `/planes/tipo/${tipo}`,
        BY_ID: (id) => `/planes/${id}`
    },
    
    // Endpoints de solicitudes
    SOLICITUDES: {
        CREATE: '/solicitudes',
        LIST: '/solicitudes',
        STATS: '/solicitudes/stats',
        UPDATE_STATUS: (id) => `/solicitudes/${id}/estado`
    },
    
    // Endpoints de tickets
    TICKETS: {
        CREATE: '/tickets',
        MY_TICKETS: '/tickets/mis-tickets',
        LIST_ADMIN: '/tickets/admin',
        STATS_ADMIN: '/tickets/admin/stats',
        DETAIL: (id) => `/tickets/${id}`,
        ADD_REPLY: (id) => `/tickets/${id}/respuesta`,
        UPDATE: (id) => `/tickets/${id}`
    },
    
    // Endpoints de administración
    ADMIN: {
        STATS: '/admin/stats',
        USERS: '/admin/usuarios',
        LOGS: '/admin/logs',
        PLANES: '/admin/planes',
        CREATE_PLAN: '/admin/planes',
        UPDATE_PLAN: (id) => `/admin/planes/${id}`,
        DELETE_PLAN: (id) => `/admin/planes/${id}`
    }
};

/**
 * Helper para hacer peticiones a la API
 * @param {string} endpoint - Ruta del endpoint (ej: '/auth/login')
 * @param {Object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise} - Respuesta de la API
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = localStorage.getItem('fiberfast_token');
    
    // Configuración base de headers
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    // Agregar token si existe
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Configuración de la petición
    const config = {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        // Si el token expiró (401), redirigir al login
        if (response.status === 401 && !endpoint.includes('/login')) {
            localStorage.removeItem('fiberfast_token');
            localStorage.removeItem('fiberfast_user');
            window.location.href = '/page/portal-cliente.html';
            throw new Error('Sesión expirada');
        }
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * Helper para peticiones GET
 */
const apiGet = (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * Helper para peticiones POST
 */
const apiPost = (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
    });
};

/**
 * Helper para peticiones PUT
 */
const apiPut = (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

/**
 * Helper para peticiones DELETE
 */
const apiDelete = (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.apiRequest = apiRequest;
    window.apiGet = apiGet;
    window.apiPost = apiPost;
    window.apiPut = apiPut;
    window.apiDelete = apiDelete;
}