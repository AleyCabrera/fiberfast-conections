// tests/api/test-ticket-detail.js
// Script específico para probar el detalle de tickets

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testTicketDetail() {
    console.log('🔍 Probando detalle de ticket...');
    
    // 1. Login
    console.log('1. Iniciando sesión...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test.1782594951616@email.com',
        password: 'Test123!'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Crear ticket
    console.log('2. Creando ticket...');
    const ticketRes = await axios.post(`${BASE_URL}/tickets`, {
        nombre: 'Test User',
        email: 'test@email.com',
        asunto: 'Problema de prueba',
        descripcion: 'Descripción de prueba'
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    const ticketId = ticketRes.data.ticketId;
    console.log(`✅ Ticket creado: #${ticketId}`);
    
    // 3. Obtener detalle
    console.log('3. Obteniendo detalle...');
    try {
        const detailRes = await axios.get(`${BASE_URL}/tickets/${ticketId}`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
        });
        console.log('✅ Detalle obtenido:', JSON.stringify(detailRes.data, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.code || error.message);
        if (error.response) {
            console.log('📝 Respuesta:', error.response.data);
        }
    }
}

testTicketDetail().catch(console.error);