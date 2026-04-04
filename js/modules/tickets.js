/**
 * Módulo de Tickets de Soporte Técnico
 * Permite a los usuarios crear y gestionar solicitudes de soporte
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
    
    /**
     * Inicializa el módulo
     */
    function init() {
        cacheElements();
        if (elements.modal) {
            attachEvents();
            cargarTickets();
            console.log('✅ Módulo de tickets inicializado');
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
        }
    }
    
    /**
     * Maneja el envío del ticket
     */
    function handleSubmit(e) {
        e.preventDefault();
        
        const ticket = {
            id: Date.now(),
            nombre: document.getElementById('ticket-nombre')?.value.trim(),
            email: document.getElementById('ticket-email')?.value.trim(),
            telefono: document.getElementById('ticket-telefono')?.value.trim(),
            tipo: document.getElementById('ticket-tipo')?.value,
            prioridad: document.getElementById('ticket-prioridad')?.value,
            asunto: document.getElementById('ticket-asunto')?.value.trim(),
            descripcion: document.getElementById('ticket-descripcion')?.value.trim(),
            fecha: new Date().toISOString(),
            estado: 'abierto'
        };
        
        // Validar campos obligatorios
        if (!ticket.nombre || !ticket.email || !ticket.asunto || !ticket.descripcion) {
            mostrarMensaje('⚠️ Por favor completa todos los campos obligatorios.', 'error');
            return;
        }
        
        // Guardar ticket
        guardarTicket(ticket);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('✅ ¡Ticket creado con éxito! Un técnico te contactará pronto.', 'success');
        
        // Cerrar modal y resetear formulario
        cerrarModal();
        elements.form.reset();
        
        // Actualizar lista de tickets
        cargarTickets();
    }
    
    /**
     * Guarda ticket en localStorage
     */
    function guardarTicket(ticket) {
        const tickets = JSON.parse(localStorage.getItem('fiberfast_tickets') || '[]');
        tickets.unshift(ticket); // Agregar al inicio
        localStorage.setItem('fiberfast_tickets', JSON.stringify(tickets));
    }
    
    /**
     * Carga y muestra los tickets del usuario
     */
    function cargarTickets() {
        if (!elements.ticketsList) return;
        
        const tickets = JSON.parse(localStorage.getItem('fiberfast_tickets') || '[]');
        const userEmail = obtenerEmailUsuario();
        
        // Filtrar tickets del usuario actual
        const userTickets = userEmail ? tickets.filter(t => t.email === userEmail) : tickets.slice(0, 3);
        
        if (userTickets.length === 0) {
            elements.ticketsList.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No tienes tickets de soporte activos.</p>
                    <button class="btn btn-primary" data-open-ticket-modal>Crear Ticket</button>
                </div>
            `;
            
            // Re-asignar evento al nuevo botón
            const newBtn = document.querySelector('[data-open-ticket-modal]');
            if (newBtn && !newBtn.hasListener) {
                newBtn.addEventListener('click', () => abrirModal());
                newBtn.hasListener = true;
            }
            return;
        }
        
        // Mostrar tickets
        elements.ticketsList.innerHTML = `
            <div class="tickets-header">
                <h4>Mis Tickets de Soporte</h4>
                <button class="btn btn-sm btn-primary" data-open-ticket-modal>+ Nuevo Ticket</button>
            </div>
            <div class="tickets-container">
                ${userTickets.map(ticket => `
                    <div class="ticket-card ${ticket.estado}">
                        <div class="ticket-header">
                            <span class="ticket-id">#${ticket.id}</span>
                            <span class="ticket-status ${ticket.estado}">${ticket.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</span>
                            <span class="ticket-priority ${ticket.prioridad}">${ticket.prioridad || 'Normal'}</span>
                        </div>
                        <div class="ticket-title">${escapeHtml(ticket.asunto)}</div>
                        <div class="ticket-date">${new Date(ticket.fecha).toLocaleDateString('es-CO')}</div>
                        <div class="ticket-type">
                            <i class="fas ${ticket.tipo === 'tecnico' ? 'fa-wrench' : ticket.tipo === 'facturacion' ? 'fa-file-invoice-dollar' : 'fa-question-circle'}"></i>
                            ${ticket.tipo === 'tecnico' ? 'Problema Técnico' : ticket.tipo === 'facturacion' ? 'Facturación' : 'Otros'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Re-asignar evento al nuevo botón
        const newBtn = document.querySelector('[data-open-ticket-modal]');
        if (newBtn && !newBtn.hasListener) {
            newBtn.addEventListener('click', () => abrirModal());
            newBtn.hasListener = true;
        }
    }
    
    /**
     * Obtiene el email del usuario logueado (simulado)
     */
    function obtenerEmailUsuario() {
        // En una implementación real, esto vendría de una sesión
        return localStorage.getItem('user_email') || null;
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

if (typeof window !== 'undefined') {
    window.TicketsModule = TicketsModule;
}