/**
 * Módulo de Tickets de Soporte Técnico
 * Conectado al backend de FiberFast
 */

'use strict';

const TicketsModule = (function() {
    // Configuración
    const CONFIG = {
        modalId: 'ticket-modal',
        formId: 'ticket-form',
        ticketsListId: 'tickets-list'
    };
    
    let elements = {};
    let currentTickets = [];
    
    /**
     * Inicializa el módulo
     */
    function init() {
        cacheElements();
        if (elements.modal) {
            attachEvents();
            cargarTickets();
            console.log('✅ Módulo de tickets inicializado (con API)');
        }
    }
    
    /**
     * Cachea elementos
     */
    function cacheElements() {
        elements = {
            modal: document.getElementById(CONFIG.modalId),
            form: document.getElementById(CONFIG.formId),
            ticketsList: document.getElementById(CONFIG.ticketsListId),
            openBtn: document.querySelector('[data-open-ticket-modal]'),
            closeBtns: document.querySelectorAll('.close-modal, .modal-close')
        };
    }
    
    /**
     * Adjunta eventos
     */
    function attachEvents() {
        // Abrir modal
        if (elements.openBtn) {
            elements.openBtn.addEventListener('click', () => abrirModal());
        }
        
        // Cerrar modal
        elements.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => cerrarModal());
        });
        
        // Cerrar al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === elements.modal) cerrarModal();
        });
        
        // Enviar formulario
        if (elements.form) {
            elements.form.addEventListener('submit', handleSubmit);
        }
    }
    
    /**
     * Abre el modal de tickets
     */
    function abrirModal() {
        if (elements.modal) {
            elements.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Cierra el modal
     */
    function cerrarModal() {
        if (elements.modal) {
            elements.modal.style.display = 'none';
            document.body.style.overflow = '';
            elements.form?.reset();
        }
    }
    
    /**
     * Carga los tickets desde la API
     */
    async function cargarTickets() {
        if (!elements.ticketsList) return;
        
        try {
            const token = localStorage.getItem('fiberfast_token');
            
            if (!token) {
                mostrarTicketsLocales();
                return;
            }
            
            // Obtener tickets del usuario desde el backend
            const response = await apiGet(API_CONFIG.TICKETS.MY_TICKETS);
            
            if (response.success) {
                currentTickets = response.tickets || [];
                renderTickets();
                updateStats();
            }
        } catch (error) {
            console.error('❌ Error cargando tickets:', error);
            mostrarTicketsLocales();
        }
    }
    
    /**
     * Muestra tickets locales como fallback
     */
    function mostrarTicketsLocales() {
        const saved = localStorage.getItem('fiberfast_tickets');
        currentTickets = saved ? JSON.parse(saved) : [];
        renderTickets();
        updateStats();
    }
    
    /**
     * Renderiza los tickets en la interfaz
     */
    function renderTickets() {
        const container = elements.ticketsList;
        if (!container) return;
        
        if (currentTickets.length === 0) {
            container.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No hay tickets</h3>
                    <p>Crea tu primer ticket de soporte para recibir asistencia técnica.</p>
                    <button class="btn btn-primary" data-open-ticket-modal>Crear Ticket</button>
                </div>
            `;
            
            // Re-asignar evento al nuevo botón
            const newBtn = container.querySelector('[data-open-ticket-modal]');
            if (newBtn) {
                newBtn.addEventListener('click', abrirModal);
            }
            return;
        }
        
        container.innerHTML = `
            <div class="tickets-header">
                <h4>Mis Tickets de Soporte</h4>
                <button class="btn btn-sm btn-primary" data-open-ticket-modal>+ Nuevo Ticket</button>
            </div>
            <div class="tickets-container">
                ${currentTickets.map(ticket => `
                    <div class="ticket-card ${ticket.estado}">
                        <div class="ticket-header">
                            <span class="ticket-id">#${ticket.id}</span>
                            <span class="ticket-status ${ticket.estado}">${getEstadoTexto(ticket.estado)}</span>
                            <span class="ticket-priority ${ticket.prioridad || 'normal'}">${getPrioridadTexto(ticket.prioridad)}</span>
                        </div>
                        <div class="ticket-title">${escapeHtml(ticket.asunto)}</div>
                        <div class="ticket-date">${new Date(ticket.created_at || ticket.fecha).toLocaleDateString('es-CO')}</div>
                        <div class="ticket-type">
                            <i class="fas ${ticket.tipo === 'tecnico' ? 'fa-wrench' : ticket.tipo === 'facturacion' ? 'fa-file-invoice-dollar' : 'fa-question-circle'}"></i>
                            ${ticket.tipo === 'tecnico' ? 'Problema Técnico' : ticket.tipo === 'facturacion' ? 'Facturación' : 'Otros'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Re-asignar evento al nuevo botón
        const newBtn = container.querySelector('[data-open-ticket-modal]');
        if (newBtn) {
            newBtn.addEventListener('click', abrirModal);
        }
    }
    
    /**
     * Actualiza las estadísticas
     */
    function updateStats() {
        const totalEl = document.getElementById('total-tickets');
        const abiertosEl = document.getElementById('abiertos-tickets');
        const cerradosEl = document.getElementById('cerrados-tickets');
        
        if (totalEl) {
            totalEl.textContent = currentTickets.length;
        }
        
        if (abiertosEl) {
            const abiertos = currentTickets.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso').length;
            abiertosEl.textContent = abiertos;
        }
        
        if (cerradosEl) {
            const cerrados = currentTickets.filter(t => t.estado === 'cerrado' || t.estado === 'resuelto').length;
            cerradosEl.textContent = cerrados;
        }
    }
    
    /**
     * Maneja el envío del ticket
     */
    async function handleSubmit(e) {
        e.preventDefault();
        
        const ticketData = {
            nombre: document.getElementById('ticket-nombre')?.value.trim(),
            email: document.getElementById('ticket-email')?.value.trim(),
            telefono: document.getElementById('ticket-telefono')?.value.trim(),
            tipo: document.getElementById('ticket-tipo')?.value || 'otros',
            prioridad: document.getElementById('ticket-prioridad')?.value || 'normal',
            asunto: document.getElementById('ticket-asunto')?.value.trim(),
            descripcion: document.getElementById('ticket-descripcion')?.value.trim()
        };
        
        // Validar campos obligatorios
        if (!ticketData.nombre || !ticketData.email || !ticketData.asunto || !ticketData.descripcion) {
            mostrarMensaje('⚠️ Por favor completa todos los campos obligatorios.', 'error');
            return;
        }
        
        // Mostrar loading
        const submitBtn = elements.form?.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        }
        
        try {
            // Enviar al backend
            const response = await apiPost(API_CONFIG.TICKETS.CREATE, ticketData);
            
            if (response.success) {
                mostrarMensaje('✅ ¡Ticket creado con éxito! Un técnico te contactará pronto.', 'success');
                cerrarModal();
                elements.form?.reset();
                
                // Recargar tickets
                await cargarTickets();
            } else {
                mostrarMensaje('❌ Error al crear el ticket: ' + (response.error || 'Intenta nuevamente'), 'error');
            }
        } catch (error) {
            console.error('Error creando ticket:', error);
            mostrarMensaje('❌ Error al crear el ticket. Por favor, intenta nuevamente.', 'error');
        }
        
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    /**
     * Obtiene el texto del estado
     */
    function getEstadoTexto(estado) {
        const estados = {
            'abierto': 'Abierto',
            'en_proceso': 'En Proceso',
            'resuelto': 'Resuelto',
            'cerrado': 'Cerrado'
        };
        return estados[estado] || estado;
    }
    
    /**
     * Obtiene el texto de prioridad
     */
    function getPrioridadTexto(prioridad) {
        const prioridades = {
            'baja': 'Baja',
            'normal': 'Normal',
            'alta': 'Alta',
            'urgente': 'Urgente'
        };
        return prioridades[prioridad] || 'Normal';
    }
    
    /**
     * Muestra mensaje en el modal
     */
    function mostrarMensaje(mensaje, tipo) {
        const msgDiv = document.getElementById('ticket-mensaje');
        if (msgDiv) {
            msgDiv.textContent = mensaje;
            msgDiv.className = `ticket-mensaje ${tipo}`;
            msgDiv.style.display = 'block';
            setTimeout(() => {
                msgDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(mensaje);
        }
    }
    
    /**
     * Escapa HTML para evitar XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // API pública
    return {
        init,
        abrirModal,
        cerrarModal,
        cargarTickets
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.TicketsModule = TicketsModule;
}