// tests/api/test-api.js
// Pruebas automáticas del backend FiberFast

const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
let token = '';
let adminToken = '';
let testUserId = null;
let testSolicitudId = null;
let testTicketId = null;

// Colores para console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

// Utilidades de logging
const log = (msg, color = 'reset') => {
    console.log(`${colors[color]}${msg}${colors.reset}`);
};

const logSection = (title) => {
    console.log('\n' + '='.repeat(70));
    log(`📌 ${title}`, 'cyan');
    console.log('='.repeat(70));
};

const logSuccess = (msg) => log(`✅ ${msg}`, 'green');
const logError = (msg) => log(`❌ ${msg}`, 'red');
const logInfo = (msg) => log(`ℹ️ ${msg}`, 'blue');
const logWarning = (msg) => log(`⚠️ ${msg}`, 'yellow');

// Función para probar un endpoint
const testEndpoint = async (name, method, url, data = null, auth = false, admin = false, retries = 2) => {
    let lastError = null;
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${url}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000, // 10 segundos de timeout
                maxRedirects: 5
            };

            // Agregar autenticación si es necesario
            if (auth) {
                const tokenToUse = admin ? adminToken : token;
                if (!tokenToUse) {
                    logWarning(`Saltando ${name}: No hay token disponible`);
                    return null;
                }
                config.headers.Authorization = `Bearer ${tokenToUse}`;
            }

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            logSuccess(`${name} (${response.status})`);
            
            // Mostrar respuesta resumida
            if (response.data) {
                const summary = JSON.stringify(response.data, null, 2);
                if (summary.length > 500) {
                    console.log(`📝 Respuesta: ${summary.substring(0, 500)}...`);
                } else {
                    console.log(`📝 Respuesta: ${summary}`);
                }
            }
            
            return response.data;
        } catch (error) {
            lastError = error;
            
            // Si es ECONNRESET y tenemos más intentos, esperar y reintentar
            if (error.code === 'ECONNRESET' && attempt <= retries) {
                logWarning(`${name} - Reintentando (${attempt}/${retries+1})...`);
                await wait(1000 * attempt); // Esperar 1s, 2s, etc.
                continue;
            }
            
            const status = error.response?.status || error.code || 'Sin respuesta';
            const message = error.response?.data?.message || error.message;
            logError(`${name} - Error ${status}: ${message}`);
            if (error.response?.data) {
                console.log('📝 Detalles:', JSON.stringify(error.response.data, null, 2));
            }
            return null;
        }
    }
    
    logError(`${name} - Falló después de ${retries+1} intentos`);
    return null;
};

// Función para esperar entre pruebas
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// PRUEBAS
// ============================================

const runTests = async () => {
    console.clear();
    log('\n' + '🌟'.repeat(40), 'yellow');
    log('🚀 FIBERFAST BACKEND - PRUEBAS AUTOMÁTICAS', 'yellow');
    log('🌟'.repeat(40), 'yellow');
    logInfo(`📡 Servidor: ${BASE_URL}`);
    logInfo(`⏰ Inicio: ${new Date().toLocaleString()}`);

    // ============================================
    // 1. HEALTH CHECK
    // ============================================
    logSection('1. HEALTH CHECK');
    
    const health = await testEndpoint('Health Check', 'GET', '/health');
    if (health) {
        logSuccess(`Servidor funcionando - Database: ${health.database}`);
    }

    await wait(500);

    // ============================================
    // 2. REGISTRO DE USUARIO
    // ============================================
    logSection('2. REGISTRO DE USUARIO');

    const registerData = {
        nombre: 'Test User',
        email: `test.${Date.now()}@email.com`,
        password: 'Test123!',
        telefono: '3001234567',
        direccion: 'Calle Test #123, Soledad',
        tipo_cliente: 'residencial'
    };

    const registerResult = await testEndpoint('Registro de Usuario', 'POST', '/auth/register', registerData);
    if (registerResult) {
        testUserId = registerResult.user?.id;
        logInfo(`Usuario creado con ID: ${testUserId}`);
    }

    await wait(500);

    // ============================================
    // 3. LOGIN - USUARIO NORMAL
    // ============================================
    logSection('3. LOGIN - USUARIO NORMAL');

    const loginData = {
        email: registerData.email,
        password: 'Test123!'
    };

    const loginResult = await testEndpoint('Login Usuario', 'POST', '/auth/login', loginData);
    if (loginResult?.token) {
        token = loginResult.token;
        logSuccess(`Token guardado para ${loginResult.user?.nombre}`);
        logInfo(`Token: ${token.substring(0, 30)}...`);
    } else {
        logError('No se pudo obtener token, algunas pruebas serán omitidas');
    }

    await wait(500);

    // ============================================
    // 4. PERFIL - PROBANDO TOKEN
    // ============================================
    if (token) {
        logSection('4. PERFIL (Protegido)');
        
        const profile = await testEndpoint('Obtener Perfil', 'GET', '/auth/profile', null, true);
        if (profile) {
            logSuccess(`Perfil: ${profile.user?.nombre} (${profile.user?.email})`);
        }
        
        await wait(500);
    }

    // ============================================
    // 5. PLANES
    // ============================================
    logSection('5. PLANES');

    await testEndpoint('Listar Todos los Planes', 'GET', '/planes');
    await testEndpoint('Plan por ID (1)', 'GET', '/planes/1');
    await testEndpoint('Planes Residenciales', 'GET', '/planes/tipo/residencial');
    await testEndpoint('Planes Empresariales', 'GET', '/planes/tipo/empresarial');

    await wait(500);

    // ============================================
    // 6. SOLICITUDES DE CONTACTO
    // ============================================
    logSection('6. SOLICITUDES DE CONTACTO');

    const solicitudData = {
        nombre: 'Cliente Test',
        email: 'cliente.test@email.com',
        telefono: '3109876543',
        plan_interes: 'Plan Plata - 600 Mbps',
        direccion: 'Calle 80 #50-30, Barranquilla',
        mensaje: 'Me interesa el plan de 600 Mbps, ¿tienen promociones?',
        origen: 'landing'
    };

    const solicitudResult = await testEndpoint('Crear Solicitud', 'POST', '/solicitudes', solicitudData);
    if (solicitudResult) {
        testSolicitudId = solicitudResult.solicitudId;
        logInfo(`Solicitud creada con ID: ${testSolicitudId}`);
    }

    await wait(500);

    // ============================================
    // 7. LOGIN - ADMIN
    // ============================================
    logSection('7. LOGIN - ADMIN');

    const adminLoginData = {
        email: 'admin@fiberfast.com.co',
        password: 'Admin123!'
    };

    const adminLoginResult = await testEndpoint('Login Admin', 'POST', '/auth/login', adminLoginData);
    if (adminLoginResult?.token) {
        adminToken = adminLoginResult.token;
        logSuccess(`Token Admin guardado para ${adminLoginResult.user?.nombre}`);
    } else {
        logError('No se pudo obtener token admin');
    }

    await wait(500);

    // ============================================
    // 8. SOLICITUDES (Admin)
    // ============================================
    if (adminToken) {
        logSection('8. SOLICITUDES - ADMIN');

        await testEndpoint('Listar Solicitudes', 'GET', '/solicitudes', null, true, true);
        await testEndpoint('Estadísticas Solicitudes', 'GET', '/solicitudes/stats', null, true, true);

        // Actualizar estado de la solicitud creada
        if (testSolicitudId) {
            const updateData = {
                estado: 'contactado',
                notas: 'Cliente contactado por teléfono, interesado en el plan'
            };
            await testEndpoint(
                'Actualizar Estado Solicitud', 
                'PUT', 
                `/solicitudes/${testSolicitudId}/estado`, 
                updateData, 
                true, 
                true
            );
        }

        await wait(500);
    }

    // ============================================
    // 9. TICKETS DE SOPORTE
    // ============================================
    logSection('9. TICKETS DE SOPORTE');

    const ticketData = {
        nombre: 'Carlos López',
        email: 'carlos.lopez@email.com',
        telefono: '3159876543',
        tipo: 'tecnico',
        prioridad: 'alta',
        asunto: 'No tengo conexión a internet',
        descripcion: 'Desde ayer en la tarde no tengo conexión a internet, el módem no enciende correctamente.'
    };

    const ticketResult = await testEndpoint('Crear Ticket (Sin Auth)', 'POST', '/tickets', ticketData);
    if (ticketResult) {
        testTicketId = ticketResult.ticketId;
        logInfo(`Ticket creado con ID: ${testTicketId}`);
    }

    await wait(500);

    // ============================================
    // 10. TICKETS - PROTEGIDOS
    // ============================================
    if (token) {
        logSection('10. TICKETS - PROTEGIDOS');

        await testEndpoint('Mis Tickets', 'GET', '/tickets/mis-tickets', null, true);
        
        // Crear ticket autenticado
        const ticketAuthData = {
            nombre: 'Juan Pérez',
            email: 'juan.perez@email.com',
            telefono: '3001234567',
            tipo: 'velocidad',
            prioridad: 'normal',
            asunto: 'Velocidad inferior a la contratada',
            descripcion: 'Tengo contratado el plan de 600 Mbps pero en las pruebas solo llegan a 200 Mbps.'
        };
        await testEndpoint('Crear Ticket (Autenticado)', 'POST', '/tickets', ticketAuthData, true);
        
        // Detalle del ticket (si existe)
        if (testTicketId) {
            await testEndpoint('Detalle de Ticket', 'GET', `/tickets/${testTicketId}`, null, true);
        }

        await wait(500);
    }

    // ============================================
    // 11. ADMIN - DASHBOARD
    // ============================================
    if (adminToken) {
        logSection('11. ADMIN - DASHBOARD');

        // Stats del dashboard
        const stats = await testEndpoint('Dashboard Stats', 'GET', '/admin/stats', null, true, true);
        if (stats) {
            logSuccess('Estadísticas del dashboard obtenidas');
            console.log('📊 Resumen:', JSON.stringify(stats.stats, null, 2));
        }

        await wait(500);

        // ============================================
        // 12. ADMIN - USUARIOS Y LOGS
        // ============================================
        logSection('12. ADMIN - USUARIOS Y LOGS');

        await testEndpoint('Listar Usuarios', 'GET', '/admin/usuarios', null, true, true);
        await testEndpoint('Logs del Sistema', 'GET', '/admin/logs?limit=10', null, true, true);

        await wait(500);

        // ============================================
        // 13. ADMIN - GESTIÓN DE PLANES
        // ============================================
        logSection('13. ADMIN - GESTIÓN DE PLANES');

        const newPlanData = {
            nombre: 'Plan Gigabit',
            velocidad: 1000,
            precio: 199900,
            tipo: 'residencial',
            caracteristicas: [
                '1000 Mbps',
                'Contenido Digital Premium',
                'Router WiFi 6E',
                'Protección avanzada',
                'Soporte VIP 24/7'
            ],
            popular: true
        };

        const newPlan = await testEndpoint('Crear Nuevo Plan', 'POST', '/admin/planes', newPlanData, true, true);
        if (newPlan) {
            logSuccess('Plan creado exitosamente');
        }

        await testEndpoint('Listar Todos los Planes (Admin)', 'GET', '/admin/planes', null, true, true);

        await wait(500);
    }

    // ============================================
    // 14. TICKETS - ADMIN (Protegidos con adminToken)
    // ============================================
    if (adminToken && testTicketId) {
        logSection('14. TICKETS - ADMIN');

        await testEndpoint('Listar Todos los Tickets', 'GET', '/tickets/admin', null, true, true);
        await testEndpoint('Estadísticas de Tickets', 'GET', '/tickets/admin/stats', null, true, true);

        // Agregar respuesta
        const replyData = {
            mensaje: 'Hemos revisado tu caso. Un técnico irá a tu domicilio mañana a las 9:00 AM.',
            es_interno: false
        };
        await testEndpoint(
            'Agregar Respuesta', 
            'POST', 
            `/tickets/${testTicketId}/respuesta`, 
            replyData, 
            true, 
            true
        );

        // Actualizar ticket
        const updateTicketData = {
            estado: 'en_proceso',
            prioridad: 'urgente',
            asignado_a: 'Ing. María Rodríguez'
        };
        await testEndpoint(
            'Actualizar Ticket', 
            'PUT', 
            `/tickets/${testTicketId}`, 
            updateTicketData, 
            true, 
            true
        );
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================
    logSection('📊 RESUMEN DE PRUEBAS');

    logInfo(`Usuario test creado: ${testUserId ? '✅' : '❌'}`);
    logInfo(`Solicitud creada: ${testSolicitudId ? '✅' : '❌'}`);
    logInfo(`Ticket creado: ${testTicketId ? '✅' : '❌'}`);
    logInfo(`Token usuario: ${token ? '✅' : '❌'}`);
    logInfo(`Token admin: ${adminToken ? '✅' : '❌'}`);

    log('\n' + '🌟'.repeat(40), 'yellow');
    log('🎉 PRUEBAS COMPLETADAS', 'green');
    log('🌟'.repeat(40), 'yellow');
    logInfo(`⏰ Fin: ${new Date().toLocaleString()}`);
};

// ============================================
// EJECUTAR PRUEBAS
// ============================================

const checkServer = async () => {
    try {
        await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
        return true;
    } catch (error) {
        return false;
    }
};

// Función principal
const main = async () => {
    console.log('🔍 Verificando servidor...');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        logError('El servidor no está corriendo en http://localhost:3000');
        logInfo('Asegúrate de ejecutar: npm run dev');
        logInfo('Luego vuelve a ejecutar: node tests/api/test-api.js');
        process.exit(1);
    }

    logSuccess('Servidor encontrado, iniciando pruebas...');
    await runTests();
};

// Ejecutar
main().catch((error) => {
    logError(`Error fatal: ${error.message}`);
    process.exit(1);
});

module.exports = { runTests };