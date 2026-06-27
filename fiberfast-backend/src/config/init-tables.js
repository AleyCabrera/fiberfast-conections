// src/config/init-tables.js - Creación de tablas
const { execute, isConnected, init: initDb } = require('./db');

const tables = {
    // Usuarios/Clientes
    clientes: `
        CREATE TABLE IF NOT EXISTS clientes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nic VARCHAR(20) UNIQUE NOT NULL COMMENT 'Número de identificación del cliente',
            nombre VARCHAR(50) NOT NULL,
            apellido VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            telefono VARCHAR(20),
            direccion TEXT COMMENT 'Dirección de instalación',
            tipo_cliente ENUM('residencial', 'empresarial') DEFAULT 'residencial',
            wishub_id VARCHAR(100) COMMENT 'ID del cliente en Wishub',
            ultimo_login DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_nic (nic),
            INDEX idx_tipo (tipo_cliente),
            INDEX idx_wishub (wishub_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Planes de internet
    planes: `
        CREATE TABLE IF NOT EXISTS planes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre VARCHAR(50) NOT NULL,
            velocidad INT NOT NULL COMMENT 'Velocidad en Mbps',
            precio DECIMAL(10,2) NOT NULL,
            tipo ENUM('residencial', 'empresarial') NOT NULL DEFAULT 'residencial',
            caracteristicas JSON,
            popular BOOLEAN DEFAULT FALSE,
            activo BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_tipo (tipo),
            INDEX idx_precio (precio),
            INDEX idx_activo (activo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Servicios contratados
    servicios_contratados: `
        CREATE TABLE IF NOT EXISTS servicios_contratados (
            id INT PRIMARY KEY AUTO_INCREMENT,
            cliente_id INT NOT NULL,
            plan_id INT NOT NULL,
            fecha_activacion DATE NOT NULL,
            fecha_cancelacion DATE NULL,
            estado ENUM('activo', 'suspendido', 'cancelado') DEFAULT 'activo',
            wishub_servicio_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES planes(id),
            INDEX idx_cliente (cliente_id),
            INDEX idx_estado (estado),
            INDEX idx_wishub (wishub_servicio_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Solicitudes de contacto
    solicitudes_contacto: `
        CREATE TABLE IF NOT EXISTS solicitudes_contacto (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            telefono VARCHAR(20) NOT NULL,
            plan_interes VARCHAR(100),
            direccion TEXT,
            mensaje TEXT,
            origen ENUM('landing', 'cobertura', 'whatsapp', 'telefono', 'otro') DEFAULT 'landing',
            estado ENUM('pendiente', 'contactado', 'convertido', 'descartado') DEFAULT 'pendiente',
            fecha_contacto DATETIME,
            notas TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_estado (estado),
            INDEX idx_origen (origen),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Tickets de soporte
    tickets: `
        CREATE TABLE IF NOT EXISTS tickets (
            id INT PRIMARY KEY AUTO_INCREMENT,
            cliente_id INT NULL,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            telefono VARCHAR(20),
            tipo ENUM('tecnico', 'facturacion', 'instalacion', 'velocidad', 'cortes', 'otros') NOT NULL,
            prioridad ENUM('baja', 'normal', 'alta', 'urgente') DEFAULT 'normal',
            asunto VARCHAR(200) NOT NULL,
            descripcion TEXT NOT NULL,
            estado ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado') DEFAULT 'abierto',
            asignado_a VARCHAR(100),
            fecha_cierre DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
            INDEX idx_cliente (cliente_id),
            INDEX idx_email (email),
            INDEX idx_estado (estado),
            INDEX idx_prioridad (prioridad),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Respuestas de tickets
    ticket_respuestas: `
        CREATE TABLE IF NOT EXISTS ticket_respuestas (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ticket_id INT NOT NULL,
            usuario_id INT NULL,
            autor VARCHAR(100) NOT NULL,
            mensaje TEXT NOT NULL,
            es_interno BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES clientes(id) ON DELETE SET NULL,
            INDEX idx_ticket (ticket_id),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Logs de autenticación
    auth_logs: `
        CREATE TABLE IF NOT EXISTS auth_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            usuario_id INT NULL,
            email VARCHAR(100) NOT NULL,
            evento VARCHAR(50) NOT NULL,
            ip VARCHAR(45),
            user_agent TEXT,
            resultado ENUM('success', 'failed', 'error') DEFAULT 'success',
            detalles TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES clientes(id) ON DELETE SET NULL,
            INDEX idx_usuario (usuario_id),
            INDEX idx_email (email),
            INDEX idx_evento (evento),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,

    // Tokens de autenticación
    tokens: `
        CREATE TABLE IF NOT EXISTS tokens (
            id INT PRIMARY KEY AUTO_INCREMENT,
            cliente_id INT NOT NULL,
            token VARCHAR(500) NOT NULL,
            tipo ENUM('access', 'refresh') DEFAULT 'access',
            expiracion DATETIME NOT NULL,
            revocado BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
            INDEX idx_token (token(255)),
            INDEX idx_expiracion (expiracion),
            INDEX idx_revocado (revocado)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
};

// Datos iniciales para la tabla de planes
const initialPlanes = [
    {
        nombre: "Plan Bronce",
        velocidad: 400,
        precio: 69900,
        tipo: "residencial",
        caracteristicas: JSON.stringify(["400 Mbps", "Contenido Digital", "10 dispositivos", "Soporte 24/7"]),
        popular: false
    },
    {
        nombre: "Plan Plata",
        velocidad: 600,
        precio: 99900,
        tipo: "residencial",
        caracteristicas: JSON.stringify(["600 Mbps", "Contenido Digital", "20 dispositivos", "Router WiFi 6", "Soporte prioritario"]),
        popular: true
    },
    {
        nombre: "Plan Oro",
        velocidad: 800,
        precio: 124900,
        tipo: "residencial",
        caracteristicas: JSON.stringify(["800 Mbps", "Contenido Digital", "30 dispositivos", "Protección avanzada", "Soporte VIP"]),
        popular: false
    },
    {
        nombre: "Pymes Fast",
        velocidad: 200,
        precio: 149900,
        tipo: "empresarial",
        caracteristicas: JSON.stringify(["200 Mbps", "IP pública opcional", "Soporte prioritario", "SLA 99.9%"]),
        popular: false
    },
    {
        nombre: "Pymes Fast Premium",
        velocidad: 600,
        precio: 249900,
        tipo: "empresarial",
        caracteristicas: JSON.stringify(["600 Mbps", "IP pública incluida", "Soporte 24/7 especializado", "SLA 99.99%"]),
        popular: true
    }
];

// Crear todas las tablas
const createTables = async () => {
    console.log('\n📦 Creando tablas...');
    let created = 0;

    for (const [tableName, createSQL] of Object.entries(tables)) {
        try {
            await execute(createSQL);
            console.log(`✅ Tabla '${tableName}' creada/verificada`);
            created++;
        } catch (error) {
            console.error(`❌ Error creando tabla '${tableName}':`, error.message);
        }
    }

    return created;
};

/**
 * Ejecuta migraciones para actualizar tablas existentes
 */
async function runMigrations() {
    console.log('\n📦 Ejecutando migraciones...');

    try {
        // Verificar si existe la columna 'nic'
        const [columns] = await execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'nic'`
        );

        if (columns.length === 0) {
            try {
                await execute(`ALTER TABLE clientes ADD COLUMN nic VARCHAR(20) UNIQUE`);
                console.log('✅ Columna "nic" agregada a clientes');
            } catch (alterError) {
                // Si la columna ya existe o hay otro error
                console.log('ℹ️ La columna "nic" ya existe o no se pudo agregar:', alterError.message);
            }
        } else {
            console.log('ℹ️ La columna "nic" ya existe');
        }

        // Verificar si existe la columna 'apellido'
        const [apellidoCol] = await execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'apellido'`
        );

        if (apellidoCol.length === 0) {
            try {
                await execute(`ALTER TABLE clientes ADD COLUMN apellido VARCHAR(50)`);
                console.log('✅ Columna "apellido" agregada a clientes');
            } catch (alterError) {
                console.log('ℹ️ La columna "apellido" ya existe o no se pudo agregar:', alterError.message);
            }
        } else {
            console.log('ℹ️ La columna "apellido" ya existe');
        }

        // Actualizar registros existentes que tengan nombre pero no apellido
        try {
            const [result] = await execute(
                `UPDATE clientes SET apellido = '' WHERE apellido IS NULL`
            );
            if (result.affectedRows > 0) {
                console.log(`✅ Actualizados ${result.affectedRows} registros con apellido vacío`);
            }
        } catch (updateError) {
            console.log('ℹ️ No se pudieron actualizar los registros:', updateError.message);
        }

        console.log('✅ Migraciones completadas');
    } catch (error) {
        console.error('❌ Error en migraciones:', error.message);
        // No detener la ejecución si falla la migración
    }
}

// Insertar datos iniciales
const insertInitialData = async () => {
    console.log('\n📝 Insertando datos iniciales...');

    try {
        // Verificar si ya hay planes
        const [existing] = await execute('SELECT COUNT(*) as count FROM planes');
        const count = existing?.[0]?.count || 0;

        if (count === 0) {
            for (const plan of initialPlanes) {
                await execute(
                    `INSERT INTO planes (nombre, velocidad, precio, tipo, caracteristicas, popular) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [plan.nombre, plan.velocidad, plan.precio, plan.tipo, plan.caracteristicas, plan.popular]
                );
            }
            console.log(`✅ Insertados ${initialPlanes.length} planes de prueba`);
        } else {
            console.log(`⏭️  Ya existen ${count} planes en la base de datos`);
        }

        // Verificar si existe usuario admin
        const [adminUser] = await execute(
            'SELECT COUNT(*) as count FROM clientes WHERE email = ?',
            ['admin@fiberfast.com.co']
        );

        if (adminUser?.[0]?.count === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            await execute(
                `INSERT INTO clientes (nic, nombre, apellido, email, password_hash, telefono, tipo_cliente) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                ['ADMIN001', 'Administrador', 'Sistema', 'admin@fiberfast.com.co', hashedPassword, '3001234567', 'empresarial']
            );
            console.log('✅ Usuario admin creado (email: admin@fiberfast.com.co, password: Admin123!)');
        }

    } catch (error) {
        console.error('❌ Error insertando datos iniciales:', error.message);
    }
};

// Función principal
const initTables = async () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 INICIANDO BASE DE DATOS');
    console.log('='.repeat(50));

    // Inicializar conexión
    await initDb();

    if (!isConnected()) {
        console.log('\n⚠️  Modo memoria activo. No se crearán tablas.');
        console.log('💡 Para usar MySQL, configura las variables DB_* en .env\n');
        return false;
    }

    try {
        // Crear tablas
        const created = await createTables();
        
        // Ejecutar migraciones
        await runMigrations();
        
        // Insertar datos iniciales
        await insertInitialData();

        console.log('\n' + '='.repeat(50));
        console.log(`✅ BASE DE DATOS INICIALIZADA (${created} tablas)`);
        console.log('='.repeat(50) + '\n');
        return true;
    } catch (error) {
        console.error('\n❌ Error en la inicialización:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
};

// Ejecutar si se llama directamente
if (require.main === module) {
    initTables()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { initTables, tables };