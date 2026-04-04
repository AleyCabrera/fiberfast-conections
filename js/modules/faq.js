/**
 * Módulo de Preguntas Frecuentes (FAQ)
 * Sistema completo de acordeón con búsqueda y filtros
 */

'use strict';

// Base de datos de preguntas frecuentes
const FAQ_DATABASE = [
    {
        id: 1,
        pregunta: "¿Cuánto tiempo dura la instalación?",
        respuesta: "La instalación se realiza en un plazo de 24 a 48 horas hábiles después de la solicitud. Nuestro técnico se coordinará contigo para agendar la visita en el horario que mejor te convenga. La instalación es completamente gratuita e incluye: <ul><li>Cableado de fibra óptica hasta tu hogar</li><li>Router WiFi 6 de última generación</li><li>Configuración y pruebas de velocidad</li><li>Capacitación básica de uso</li></ul>",
        categoria: "instalacion",
        tags: ["instalación", "tiempo", "demora", "gratis"]
    },
    {
        id: 2,
        pregunta: "¿Hay cláusula de permanencia?",
        respuesta: "No exigimos permanencia mínima. Puedes cancelar el servicio en cualquier momento sin penalización. Sin embargo, si cancelas antes de los 6 meses, se aplicará un cargo proporcional por el router WiFi 6 proporcionado (equivalente al tiempo restante de los 6 meses). Después de los 6 meses, el equipo es tuyo sin costo adicional.",
        categoria: "contrato",
        tags: ["permanencia", "cancelar", "penalización", "multa"]
    },
    {
        id: 3,
        pregunta: "¿Qué incluye el 'Contenido Digital'?",
        respuesta: "El Contenido Digital incluido en nuestros planes residenciales incluye: <ul><li><strong>Más de 80 canales en HD</strong> (noticias, deportes, entretenimiento, infantiles)</li><li><strong>Plataforma de streaming</strong> con más de 5000 películas y series bajo demanda</li><li><strong>Canales deportivos premium</strong> (fútbol, tenis, F1, etc.)</li><li><strong>Acceso desde cualquier dispositivo</strong> (TV, celular, tablet, computadora)</li><li><strong>Grabación en la nube</strong> de hasta 50 horas</li></ul>",
        categoria: "servicios",
        tags: ["contenido", "canales", "streaming", "tv", "películas"]
    },
    {
        id: 4,
        pregunta: "¿Cómo puedo pagar mi factura?",
        respuesta: "Aceptamos múltiples métodos de pago para tu comodidad: <ul><li><strong>PSE</strong> - Pago seguro desde tu banco</li><li><strong>Tarjetas débito/crédito</strong> (Visa, Mastercard, American Express)</li><li><strong>Efectivo</strong> en Baloto, Efecty, Gana, SuRed</li><li><strong>Débito automático</strong> desde tu cuenta bancaria</li><li><strong>Transferencia bancaria</strong> a nuestras cuentas</li><li><strong>Oficinas físicas</strong> en Soledad y Barranquilla</li></ul>La factura se genera el mismo día de cada mes y tienes 10 días hábiles para pagar sin intereses.",
        categoria: "pagos",
        tags: ["pagar", "factura", "pago", "métodos", "transferencia"]
    },
    {
        id: 5,
        pregunta: "¿Qué hago si tengo problemas de conexión?",
        respuesta: "Si experimentas problemas de conexión, puedes: <ol><li><strong>Reiniciar el router</strong> (desconectar y conectar después de 30 segundos)</li><li><strong>Verificar las luces del módem</strong> (deben estar todas verdes)</li><li><strong>Contactar a nuestro soporte 24/7</strong> vía WhatsApp, teléfono o creando un ticket en nuestra página</li></ol>Nuestro equipo técnico responderá en menos de 15 minutos y, si es necesario, enviaremos un técnico a tu domicilio el mismo día.",
        categoria: "soporte",
        tags: ["problemas", "conexión", "soporte", "técnico", "falla"]
    },
    {
        id: 6,
        pregunta: "¿La velocidad es simétrica?",
        respuesta: "¡Sí! Todos nuestros planes ofrecen <strong>velocidad simétrica</strong>, lo que significa que la velocidad de subida es igual a la de bajada. Esto es ideal para: <ul><li>Videollamadas sin cortes</li><li>Subir archivos pesados a la nube</li><li>Streaming en 4K</li><li>Gaming online sin lag</li><li>Trabajo remoto con VPN</li></ul>Por ejemplo, en el Plan Oro de 800 Mbps, tendrás 800 Mbps de descarga Y 800 Mbps de subida.",
        categoria: "tecnico",
        tags: ["velocidad", "simétrica", "subida", "descarga", "mbps"]
    },
    {
        id: 7,
        pregunta: "¿Puedo cambiar mi plan después de contratar?",
        respuesta: "Sí, puedes cambiar de plan en cualquier momento sin costo adicional. El proceso es muy sencillo: <ol><li>Ingresa al Portal de Clientes</li><li>Selecciona 'Cambiar mi plan'</li><li>Elige el nuevo plan deseado</li><li>Confirma el cambio</li></ol>El cambio se aplica en tu próximo ciclo de facturación y no hay interrupción del servicio. El precio se ajustará proporcionalmente según la fecha del cambio.",
        categoria: "contrato",
        tags: ["cambiar", "plan", "upgrade", "mejorar"]
    },
    {
        id: 8,
        pregunta: "¿Ofrecen IP fija para empresas?",
        respuesta: "Sí, en nuestros planes empresariales incluimos IP pública fija sin costo adicional. Para planes residenciales, está disponible como adicional por $20.000/mes. Beneficios de la IP fija: <ul><li>Acceso remoto a servidores y cámaras</li><li>Hosting de servicios (web, email, FTP)</li><li>VPN empresarial</li><li>Mayor seguridad y control</li></ul>",
        categoria: "empresarial",
        tags: ["ip", "fija", "empresa", "negocio", "pública"]
    },
    {
        id: 9,
        pregunta: "¿Qué cobertura tienen en el Atlántico?",
        respuesta: "Actualmente tenemos cobertura de fibra óptica en los siguientes municipios del Atlántico: <ul><li><strong>Soledad</strong> (cobertura completa)</li><li><strong>Barranquilla</strong> (80% de la ciudad)</li><li><strong>Malambo</strong> (cobertura completa)</li><li><strong>Sabanagrande</strong> (zonas urbanas)</li><li><strong>Santo Tomás</strong> (zonas urbanas)</li><li><strong>Palmar de Varela</strong> (zonas urbanas)</li><li><strong>Campo de la Cruz</strong> (zonas urbanas)</li><li><strong>Manatí</strong> (zonas urbanas)</li></ul>Estamos expandiendo nuestra red constantemente. Próximamente: Cartagena y Santa Marta.",
        categoria: "instalacion",
        tags: ["cobertura", "atlántico", "zonas", "barranquilla", "soledad"]
    },
    {
        id: 10,
        pregunta: "¿Ofrecen servicio técnico los fines de semana?",
        respuesta: "¡Sí! Nuestro soporte técnico está disponible <strong>24/7, los 365 días del año</strong>, incluyendo fines de semana y festivos. El servicio de atención al cliente por chat y teléfono funciona sin interrupción. Para visitas técnicas a domicilio, también atendemos los sábados y domingos en horario de 8:00 AM a 6:00 PM. Las emergencias técnicas se atienden de inmediato cualquier día y hora.",
        categoria: "soporte",
        tags: ["fin de semana", "sábado", "domingo", "horario", "técnico"]
    }
];

// Configuración
const FAQ_CONFIG = {
    searchInputId: 'faq-search-input',
    categorySelectId: 'faq-category-select',
    containerId: 'faq-container'
};

// Estado
let currentFilter = {
    search: '',
    category: 'todas'
};

/**
 * Inicializa el módulo FAQ
 */
function initFAQ() {
    console.log('🔧 Inicializando FAQ...');
    
    // Verificar que los elementos existan
    const searchInput = document.getElementById(FAQ_CONFIG.searchInputId);
    const categorySelect = document.getElementById(FAQ_CONFIG.categorySelectId);
    const container = document.getElementById(FAQ_CONFIG.containerId);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor del FAQ');
        return;
    }
    
    // Renderizar preguntas
    renderFAQ();
    
    // Configurar eventos
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        console.log('✅ Evento de búsqueda configurado');
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
        console.log('✅ Evento de categoría configurado');
    }
    
    console.log('✅ FAQ inicializado correctamente');
}

/**
 * Renderiza las preguntas según los filtros actuales
 */
function renderFAQ() {
    const container = document.getElementById(FAQ_CONFIG.containerId);
    if (!container) return;
    
    // Filtrar preguntas
    let filteredFAQs = [...FAQ_DATABASE];
    
    // Filtrar por categoría
    if (currentFilter.category !== 'todas') {
        filteredFAQs = filteredFAQs.filter(faq => faq.categoria === currentFilter.category);
    }
    
    // Filtrar por búsqueda
    if (currentFilter.search.trim() !== '') {
        const searchTerm = currentFilter.search.toLowerCase().trim();
        filteredFAQs = filteredFAQs.filter(faq => 
            faq.pregunta.toLowerCase().includes(searchTerm) ||
            faq.respuesta.toLowerCase().includes(searchTerm) ||
            faq.tags.some(tag => tag.includes(searchTerm))
        );
    }
    
    // Mostrar contador de resultados
    const counterHTML = `<div class="faq-counter">${filteredFAQs.length} pregunta${filteredFAQs.length !== 1 ? 's' : ''} encontrada${filteredFAQs.length !== 1 ? 's' : ''}</div>`;
    
    // Si no hay resultados
    if (filteredFAQs.length === 0) {
        container.innerHTML = `
            ${counterHTML}
            <div class="faq-no-results">
                <i class="fas fa-search"></i>
                <h4>No encontramos resultados</h4>
                <p>Intenta con otras palabras clave o revisa todas las categorías</p>
            </div>
        `;
        return;
    }
    
    // Renderizar preguntas
    container.innerHTML = `
        ${counterHTML}
        ${filteredFAQs.map(faq => `
            <div class="faq-item" data-id="${faq.id}" data-categoria="${faq.categoria}">
                <div class="faq-question">
                    <span>
                        <span class="faq-category-badge">${getCategoryName(faq.categoria)}</span>
                        ${escapeHtml(faq.pregunta)}
                    </span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        ${formatAnswer(faq.respuesta)}
                    </div>
                </div>
            </div>
        `).join('')}
    `;
    
    // Configurar eventos de click para cada pregunta
    document.querySelectorAll('.faq-question').forEach((question, index) => {
        question.addEventListener('click', (e) => {
            e.stopPropagation();
            const faqItem = question.closest('.faq-item');
            toggleFAQ(faqItem);
        });
    });
}

/**
 * Obtiene el nombre legible de la categoría
 */
function getCategoryName(categoria) {
    const categorias = {
        'instalacion': '📡 Instalación',
        'contrato': '📋 Contrato',
        'servicios': '🎬 Servicios',
        'pagos': '💰 Pagos',
        'soporte': '🛠️ Soporte',
        'tecnico': '⚡ Técnico',
        'empresarial': '🏢 Empresarial'
    };
    return categorias[categoria] || categoria;
}

/**
 * Formatea la respuesta (convierte markdown simple a HTML)
 */
function formatAnswer(text) {
    if (!text) return '';
    
    // Reemplazar listas ul
    let formatted = text.replace(/<ul>/g, '<ul style="margin: 1rem 0; padding-left: 1.5rem;">');
    formatted = formatted.replace(/<\/ul>/g, '</ul>');
    formatted = formatted.replace(/<li>/g, '<li style="margin-bottom: 0.5rem;">');
    
    // Reemplazar listas ol
    formatted = formatted.replace(/<ol>/g, '<ol style="margin: 1rem 0; padding-left: 1.5rem;">');
    formatted = formatted.replace(/<\/ol>/g, '</ol>');
    
    // Reemplazar strong
    formatted = formatted.replace(/<strong>/g, '<strong style="color: var(--primary-600);">');
    
    return formatted;
}

/**
 * Alterna la apertura/cierre de un item FAQ
 */
function toggleFAQ(faqItem) {
    if (!faqItem) return;
    
    const isOpen = faqItem.classList.contains('open');
    
    // Opcional: cerrar otros items (comentar si quieres múltiples abiertos)
    // document.querySelectorAll('.faq-item').forEach(item => {
    //     if (item !== faqItem) item.classList.remove('open');
    // });
    
    if (!isOpen) {
        faqItem.classList.add('open');
        // Scroll suave al elemento
        setTimeout(() => {
            faqItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        faqItem.classList.remove('open');
    }
}

/**
 * Maneja la búsqueda en tiempo real
 */
function handleSearch(event) {
    currentFilter.search = event.target.value;
    renderFAQ();
}

/**
 * Maneja el cambio de categoría
 */
function handleCategoryChange(event) {
    currentFilter.category = event.target.value;
    renderFAQ();
}

/**
 * Escapa HTML para evitar XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
} else {
    initFAQ();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.FAQModule = {
        init: initFAQ,
        render: renderFAQ,
        search: handleSearch,
        filter: handleCategoryChange
    };
}