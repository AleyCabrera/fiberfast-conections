// src/utils/wishub.service.js
const axios = require('axios');
require('dotenv').config();

const wishubApi = axios.create({
    baseURL: process.env.WISHUB_API_URL || 'https://api.wishub.com/v1',
    headers: {
        'Authorization': `Bearer ${process.env.WISHUB_API_KEY || ''}`,
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

const wishubService = {
    async createCustomer(customerData) {
        try {
            const response = await wishubApi.post('/customers', customerData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cliente en Wishub:', error.response?.data || error.message);
            throw new Error('No se pudo sincronizar el cliente con Wishub');
        }
    },

    async createService(clienteId, planId, customerData) {
        try {
            const response = await wishubApi.post('/services', {
                customer_id: clienteId,
                plan_id: planId,
                ...customerData
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear servicio en Wishub:', error.response?.data || error.message);
            throw new Error('No se pudo sincronizar el servicio con Wishub');
        }
    },

    async checkCoverage(direccion) {
        try {
            const response = await wishubApi.get('/coverage', {
                params: { address: direccion }
            });
            return response.data;
        } catch (error) {
            console.error('Error verificando cobertura:', error.response?.data || error.message);
            return { available: false, error: 'Servicio no disponible' };
        }
    }
};

module.exports = wishubService;