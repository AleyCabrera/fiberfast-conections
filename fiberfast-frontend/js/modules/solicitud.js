/**
 * Módulo de Solicitud de Servicio
 * Conectado al backend de FiberFast
 */

'use strict';

const SolicitudModule = (function() {
    // Configuración
    const CONFIG = {
        formId: 'solicitud-form',
        campos: ['nombre', 'telefono', 'email', 'direccion', 'plan', 'mensaje']
    };
    
    let elements = {};
    
    /**
     * Inicializa el módulo
     */
    function init() {
        cacheElements();
        if (elements.form) {
            attachEvents();
            cargarPlanesDesdeAPI();
            console.log('✅ Módulo de solicitud inicializado (con API)');
        }
    }
    
    /**
     * Cachea elementos
     */
    function cacheElements() {
        elements = {
            form: document.getElementById(CONFIG.formId),
            nombre: document.getElementById('nombre-solicitud'),
            telefono: document.getElementById('telefono-solicitud'),
            email: document.getElementById('email-solicitud'),
            direccion: document.getElementById('direccion-solicitud'),
            plan: document.getElementById('plan-solicitud'),
            mensaje: document.getElementById('mensaje-solicitud'),
            btnSubmit: document.querySelector('#solicitud-form button[type="submit"]')
        };
    }
    
    /**
     * Carga los planes desde la API
     */
    async function cargarPlanesDesdeAPI() {
        if (!elements.plan) return;
        
        try {
            // Limpiar select actual
            elements.plan.innerHTML = '<option value="">Selecciona un plan...</option>';
            
            // Obtener planes desde el backend
            const response = await apiGet(API_CONFIG.PLANES.LIST);
            
            if (response.success && response.planes) {
                response.planes.forEach(plan => {
                    const option = document.createElement('option');
                    option.value = plan.id;
                    option.textContent = `${plan.nombre} - ${plan.velocidad} Mbps - $${plan.precio.toLocaleString()}/mes`;
                    elements.plan.appendChild(option);
                });
                console.log('✅ Planes cargados desde el backend');
            }
        } catch (error) {
            console.error('❌ Error cargando planes:', error);
            // Fallback a planes locales si falla la API
            cargarPlanesLocal();
        }
    }
    
    /**
     * Carga planes locales (fallback)
     */
    function cargarPlanesLocal() {
        if (!elements.plan) return;
        
        const planes = [
            { value: 'bronce', label: 'Plan Bronce - 400 Mbps - $69.900/mes' },
            { value: 'plata', label: 'Plan Plata - 600 Mbps - $99.900/mes' },
            { value: 'oro', label: 'Plan Oro - 800 Mbps - $124.900/mes' },
            { value: 'empresarial', label: 'Plan Empresarial - 200 Mbps - Consultar' },
            { value: 'empresarial-premium', label: 'Plan Empresarial Premium - 600 Mbps - Consultar' }
        ];
        
        planes.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.value;
            option.textContent = plan.label;
            elements.plan.appendChild(option);
        });
    }
    
    /**
     * Adjunta eventos
     */
    function attachEvents() {
        elements.form.addEventListener('submit', handleSubmit);
        
        // Validación en tiempo real
        if (elements.telefono) {
            elements.telefono.addEventListener('input', validarTelefono);
        }
        if (elements.email) {
            elements.email.addEventListener('input', validarEmail);
        }
    }
    
    /**
     * Valida teléfono en tiempo real
     */
    function validarTelefono() {
        const telefono = elements.telefono.value.trim();
        const regex = /^[0-9]{7,10}$/;
        const errorSpan = document.getElementById('error-telefono-solicitud');
        
        if (!regex.test(telefono) && telefono !== '') {
            errorSpan.textContent = '⚠️ Ingresa un número válido (7-10 dígitos)';
            errorSpan.style.display = 'block';
            return false;
        } else {
            errorSpan.style.display = 'none';
            return true;
        }
    }
    
    /**
     * Valida email en tiempo real
     */
    function validarEmail() {
        const email = elements.email.value.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorSpan = document.getElementById('error-email-solicitud');
        
        if (!regex.test(email) && email !== '') {
            errorSpan.textContent = '⚠️ Ingresa un correo electrónico válido';
            errorSpan.style.display = 'block';
            return false;
        } else {
            errorSpan.style.display = 'none';
            return true;
        }
    }
    
    /**
     * Valida todos los campos del formulario
     */
    function validarFormulario() {
        let esValido = true;
        
        // Validar nombre
        if (!elements.nombre.value.trim()) {
            mostrarError('nombre-solicitud', '⚠️ El nombre es obligatorio');
            esValido = false;
        } else {
            ocultarError('nombre-solicitud');
        }
        
        // Validar teléfono
        if (!validarTelefono() || !elements.telefono.value.trim()) {
            mostrarError('telefono-solicitud', '⚠️ Teléfono obligatorio (7-10 dígitos)');
            esValido = false;
        } else {
            ocultarError('telefono-solicitud');
        }
        
        // Validar email
        if (!validarEmail() || !elements.email.value.trim()) {
            mostrarError('email-solicitud', '⚠️ Correo electrónico válido obligatorio');
            esValido = false;
        } else {
            ocultarError('email-solicitud');
        }
        
        // Validar dirección
        if (!elements.direccion.value.trim()) {
            mostrarError('direccion-solicitud', '⚠️ La dirección es obligatoria');
            esValido = false;
        } else {
            ocultarError('direccion-solicitud');
        }
        
        // Validar plan
        if (!elements.plan.value) {
            mostrarError('plan-solicitud', '⚠️ Selecciona un plan');
            esValido = false;
        } else {
            ocultarError('plan-solicitud');
        }
        
        return esValido;
    }
    
    /**
     * Muestra mensaje de error para un campo
     */
    function mostrarError(campoId, mensaje) {
        const errorSpan = document.getElementById(`error-${campoId}`);
        if (errorSpan) {
            errorSpan.textContent = mensaje;
            errorSpan.style.display = 'block';
        }
    }
    
    /**
     * Oculta mensaje de error
     */
    function ocultarError(campoId) {
        const errorSpan = document.getElementById(`error-${campoId}`);
        if (errorSpan) {
            errorSpan.style.display = 'none';
        }
    }
    
    /**
     * Maneja el envío del formulario
     */
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            mostrarMensajeGlobal('❌ Por favor completa todos los campos correctamente.', 'error');
            return;
        }
        
        // Mostrar loading
        const textoOriginal = elements.btnSubmit.textContent;
        elements.btnSubmit.disabled = true;
        elements.btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        // Recopilar datos
        const datos = {
            nombre: elements.nombre.value.trim(),
            telefono: elements.telefono.value.trim(),
            email: elements.email.value.trim(),
            direccion: elements.direccion.value.trim(),
            plan_interes: elements.plan.options[elements.plan.selectedIndex]?.text || '',
            mensaje: elements.mensaje?.value.trim() || '',
            origen: 'landing'
        };
        
        try {
            // Enviar al backend
            const response = await apiPost(API_CONFIG.SOLICITUDES.CREATE, datos);
            
            if (response.success) {
                mostrarMensajeGlobal('✅ ¡Solicitud enviada con éxito! Un asesor te contactará en menos de 24 horas.', 'success');
                elements.form.reset();
            } else {
                mostrarMensajeGlobal('❌ Error al enviar la solicitud: ' + (response.error || 'Intenta nuevamente'), 'error');
            }
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            mostrarMensajeGlobal('❌ Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
        }
        
        // Restaurar botón
        elements.btnSubmit.disabled = false;
        elements.btnSubmit.textContent = textoOriginal;
    }
    
    /**
     * Muestra mensaje global
     */
    function mostrarMensajeGlobal(mensaje, tipo) {
        if (window.fiberFastApp && window.fiberFastApp.showNotification) {
            window.fiberFastApp.showNotification(mensaje, tipo);
        } else {
            alert(mensaje);
        }
    }
    
    // API pública
    return {
        init,
        cargarPlanesDesdeAPI
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SolicitudModule = SolicitudModule;
}