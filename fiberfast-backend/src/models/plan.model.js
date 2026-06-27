// src/models/plan.model.js
const { execute, isConnected } = require('../config/db');

// Datos en memoria para fallback
const MEMORY_PLANS = [
    { id: 1, nombre: "Plan Bronce", velocidad: 400, precio: 69900, tipo: "residencial", popular: false, caracteristicas: ["400 Mbps", "Contenido Digital", "10 dispositivos", "Soporte 24/7"] },
    { id: 2, nombre: "Plan Plata", velocidad: 600, precio: 99900, tipo: "residencial", popular: true, caracteristicas: ["600 Mbps", "Contenido Digital", "20 dispositivos", "Router WiFi 6", "Soporte prioritario"] },
    { id: 3, nombre: "Plan Oro", velocidad: 800, precio: 124900, tipo: "residencial", popular: false, caracteristicas: ["800 Mbps", "Contenido Digital", "30 dispositivos", "Protección avanzada", "Soporte VIP"] },
    { id: 4, nombre: "Pymes Fast", velocidad: 200, precio: 149900, tipo: "empresarial", popular: false, caracteristicas: ["200 Mbps", "IP pública opcional", "Soporte prioritario", "SLA 99.9%"] },
    { id: 5, nombre: "Pymes Fast Premium", velocidad: 600, precio: 249900, tipo: "empresarial", popular: true, caracteristicas: ["600 Mbps", "IP pública incluida", "Soporte 24/7 especializado", "SLA 99.99%"] }
];

// Función segura para parsear JSON
const safeParseJSON = (jsonString) => {
    if (!jsonString) return [];
    
    try {
        // Si es un string, intentar parsear
        if (typeof jsonString === 'string') {
            // Limpiar caracteres no deseados
            const cleanString = jsonString.trim();
            // Intentar parsear
            const parsed = JSON.parse(cleanString);
            // Si es un array, devolverlo
            if (Array.isArray(parsed)) {
                return parsed;
            }
            // Si es un objeto, convertirlo a array de strings
            if (typeof parsed === 'object') {
                return Object.values(parsed).filter(val => typeof val === 'string');
            }
            // Si es un string simple, devolverlo como array
            return [String(parsed)];
        }
        // Si ya es un array, devolverlo
        if (Array.isArray(jsonString)) {
            return jsonString;
        }
        // Si es un objeto, convertirlo
        if (typeof jsonString === 'object') {
            return Object.values(jsonString);
        }
        return [];
    } catch (error) {
        console.warn('⚠️ Error parseando JSON:', jsonString, error.message);
        
        // Si es un string, intentar limpiarlo
        if (typeof jsonString === 'string') {
            // Intentar extraer características del texto
            const matches = jsonString.match(/["']([^"']*)["']/g);
            if (matches) {
                return matches.map(m => m.replace(/["']/g, '').trim());
            }
            // Si no se puede extraer, devolver el string como única característica
            return [jsonString.replace(/[\[\]"]/g, '').trim()];
        }
        return [];
    }
};

// Función segura para stringificar JSON
const safeStringifyJSON = (data) => {
    try {
        if (!data || data.length === 0) return '[]';
        if (typeof data === 'string') {
            // Verificar si ya es un JSON válido
            try {
                JSON.parse(data);
                return data;
            } catch (e) {
                // Si no es válido, convertirlo a array
                return JSON.stringify([data]);
            }
        }
        if (Array.isArray(data)) {
            return JSON.stringify(data);
        }
        if (typeof data === 'object') {
            return JSON.stringify(Object.values(data));
        }
        return JSON.stringify([String(data)]);
    } catch (error) {
        console.warn('⚠️ Error stringificando JSON:', error.message);
        return '[]';
    }
};

const Plan = {
    async findAll(filters = {}) {
        // Si no hay conexión a BD, usar memoria
        if (!isConnected()) {
            console.log('📝 [MODO MEMORIA] Listando planes');
            return this._filterPlans(MEMORY_PLANS, filters);
        }

        try {
            let sql = 'SELECT * FROM planes WHERE activo = 1';
            const params = [];

            if (filters.tipo) {
                sql += ' AND tipo = ?';
                params.push(filters.tipo);
            }

            sql += ' ORDER BY precio ASC';

            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(parseInt(filters.limit));
            }

            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }

            const [rows] = await execute(sql, params);
            
            // Si no hay datos en la BD, usar memoria
            if (!rows || rows.length === 0) {
                console.log('⚠️ No hay planes en la BD, usando datos en memoria');
                return this._filterPlans(MEMORY_PLANS, filters);
            }

            // Procesar cada plan con parseo seguro
            return rows.map(row => {
                const parsedPlan = {
                    ...row,
                    caracteristicas: safeParseJSON(row.caracteristicas)
                };
                return parsedPlan;
            });
        } catch (error) {
            console.error('❌ Error en Plan.findAll:', error.message);
            console.log('⚠️ Usando datos en memoria por error en la BD');
            return this._filterPlans(MEMORY_PLANS, filters);
        }
    },

    // Método auxiliar para filtrar planes en memoria
    _filterPlans(plans, filters = {}) {
        let filtered = [...plans];
        
        if (filters.tipo) {
            filtered = filtered.filter(p => p.tipo === filters.tipo);
        }
        
        if (filters.limit) {
            filtered = filtered.slice(0, parseInt(filters.limit));
        }
        
        return filtered;
    },

    async findById(id) {
        // Si no hay conexión a BD, usar memoria
        if (!isConnected()) {
            console.log('📝 [MODO MEMORIA] Buscando plan por ID:', id);
            const plan = MEMORY_PLANS.find(p => p.id === id);
            return plan || null;
        }

        try {
            const [rows] = await execute('SELECT * FROM planes WHERE id = ? AND activo = 1', [id]);
            
            // Si no hay datos en la BD, buscar en memoria
            if (!rows || rows.length === 0) {
                console.log('⚠️ Plan no encontrado en BD, buscando en memoria');
                const plan = MEMORY_PLANS.find(p => p.id === id);
                return plan || null;
            }

            const plan = rows[0];
            plan.caracteristicas = safeParseJSON(plan.caracteristicas);
            return plan;
        } catch (error) {
            console.error('❌ Error en Plan.findById:', error.message);
            // Fallback a memoria
            const plan = MEMORY_PLANS.find(p => p.id === id);
            return plan || null;
        }
    },

    async findByType(tipo) {
        // Si no hay conexión a BD, usar memoria
        if (!isConnected()) {
            console.log('📝 [MODO MEMORIA] Buscando planes por tipo:', tipo);
            return this._filterPlans(MEMORY_PLANS, { tipo });
        }

        try {
            const [rows] = await execute(
                'SELECT * FROM planes WHERE tipo = ? AND activo = 1 ORDER BY precio ASC',
                [tipo]
            );
            
            // Si no hay datos en la BD, usar memoria
            if (!rows || rows.length === 0) {
                console.log('⚠️ No hay planes en BD para tipo:', tipo);
                return this._filterPlans(MEMORY_PLANS, { tipo });
            }

            return rows.map(row => ({
                ...row,
                caracteristicas: safeParseJSON(row.caracteristicas)
            }));
        } catch (error) {
            console.error('❌ Error en Plan.findByType:', error.message);
            return this._filterPlans(MEMORY_PLANS, { tipo });
        }
    },

    async create(data) {
        if (!isConnected()) {
            console.log('📝 [MODO MEMORIA] Creando plan:', data.nombre);
            const newPlan = {
                id: MEMORY_PLANS.length + 1,
                ...data,
                popular: data.popular || false,
                activo: 1,
                caracteristicas: Array.isArray(data.caracteristicas) ? data.caracteristicas : []
            };
            MEMORY_PLANS.push(newPlan);
            return newPlan.id;
        }

        try {
            const caracteristicas = safeStringifyJSON(data.caracteristicas || []);
            const [result] = await execute(
                `INSERT INTO planes (nombre, velocidad, precio, tipo, caracteristicas, popular, activo) 
                 VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [data.nombre, data.velocidad, data.precio, data.tipo, caracteristicas, data.popular || false]
            );
            return result.insertId;
        } catch (error) {
            console.error('❌ Error en Plan.create:', error.message);
            return null;
        }
    },

    async update(id, data) {
        if (!isConnected()) {
            console.log('📝 [MODO MEMORIA] Actualizando plan:', id);
            const plan = MEMORY_PLANS.find(p => p.id === id);
            if (plan) {
                Object.assign(plan, data);
                return true;
            }
            return false;
        }

        try {
            const fields = [];
            const values = [];

            if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
            if (data.velocidad !== undefined) { fields.push('velocidad = ?'); values.push(data.velocidad); }
            if (data.precio !== undefined) { fields.push('precio = ?'); values.push(data.precio); }
            if (data.tipo !== undefined) { fields.push('tipo = ?'); values.push(data.tipo); }
            if (data.caracteristicas !== undefined) {
                fields.push('caracteristicas = ?');
                values.push(safeStringifyJSON(data.caracteristicas));
            }
            if (data.popular !== undefined) { fields.push('popular = ?'); values.push(data.popular); }
            if (data.activo !== undefined) { fields.push('activo = ?'); values.push(data.activo); }

            if (fields.length === 0) return false;

            values.push(id);
            const [result] = await execute(
                `UPDATE planes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Error en Plan.update:', error.message);
            return false;
        }
    }
};

module.exports = Plan;