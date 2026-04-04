/**
 * Módulo de Verificación de Cobertura
 * Permite a los usuarios verificar si FiberFast tiene cobertura en su dirección
 */

'use strict';

const CoberturaModule = (function() {
    // Zonas con cobertura (expandible)
    const ZONAS_COBERTURA = [
        'soledad', 'atlantico', 'barranquilla', 'malambo', 'sabanagrande',
        'santo tomas', 'palmar de varela', 'campo de la cruz', 'manati'
    ];
    
    // Configuración
    const CONFIG = {
        inputId: 'direccion-cobertura',
        buttonId: 'btn-verificar-cobertura',
        resultId: 'resultado-cobertura'
    };
    
    // Elementos DOM
    let elements = {};
    
    /**
     * Inicializa el módulo
     */
    function init() {
        cacheElements();
        if (elements.input && elements.button) {
            attachEvents();
            console.log('✅ Módulo de cobertura inicializado');
        }
    }
    
    /**
     * Cachea elementos del DOM
     */
    function cacheElements() {
        elements = {
            input: document.getElementById(CONFIG.inputId),
            button: document.getElementById(CONFIG.buttonId),
            result: document.getElementById(CONFIG.resultId)
        };
    }
    
    /**
     * Adjunta eventos
     */
    function attachEvents() {
        elements.button.addEventListener('click', verificarCobertura);
        elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verificarCobertura();
        });
    }
    
    /**
     * Verifica si hay cobertura en la dirección ingresada
     */
    function verificarCobertura() {
        const direccion = elements.input.value.toLowerCase().trim();
        
        if (!direccion) {
            mostrarResultado('❌ Por favor ingresa una dirección para verificar.', 'error');
            return;
        }
        
        // Verificar cobertura
        const tieneCobertura = ZONAS_COBERTURA.some(zona => direccion.includes(zona));
        
        if (tieneCobertura) {
            mostrarResultado(
                '✅ ¡Excelente! FiberFast tiene cobertura en tu zona. Puedes contratar nuestro servicio ahora mismo.',
                'success'
            );
            
            // Auto-llenar campo de dirección en el formulario de solicitud
            const campoDireccion = document.getElementById('direccion-solicitud');
            if (campoDireccion) {
                campoDireccion.value = direccion;
                // Scroll suave al formulario
                document.getElementById('solicitud-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            mostrarResultado(
                '❌ Lo sentimos, FiberFast aún no tiene cobertura en tu zona. Déjanos tus datos y te avisaremos cuando lleguemos.',
                'error'
            );
            
            // Mostrar formulario de notificación
            mostrarFormularioNotificacion();
        }
    }
    
    /**
     * Muestra el resultado en la interfaz
     */
    function mostrarResultado(mensaje, tipo) {
        if (!elements.result) return;
        
        elements.result.innerHTML = `
            <div class="cobertura-resultado ${tipo}">
                <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${mensaje}</span>
            </div>
        `;
        elements.result.style.display = 'block';
        
        // Auto-ocultar después de 8 segundos
        setTimeout(() => {
            if (elements.result) {
                elements.result.style.opacity = '0';
                setTimeout(() => {
                    if (elements.result) elements.result.style.display = 'none';
                }, 300);
            }
        }, 8000);
    }
    
    /**
     * Muestra formulario para notificar cuando haya cobertura
     */
    function mostrarFormularioNotificacion() {
        const existingForm = document.querySelector('.notificacion-cobertura');
        if (existingForm) return;
        
        const formHtml = `
            <div class="notificacion-cobertura">
                <p><i class="fas fa-bell"></i> ¡Déjanos tu correo y te avisaremos cuando FiberFast llegue a tu zona!</p>
                <div class="notificacion-input-group">
                    <input type="email" id="email-notificacion" placeholder="tu@email.com" required>
                    <button id="btn-notificar" class="btn btn-secondary">Notificarme</button>
                </div>
            </div>
        `;
        
        elements.result.insertAdjacentHTML('beforeend', formHtml);
        
        const btnNotificar = document.getElementById('btn-notificar');
        const emailInput = document.getElementById('email-notificacion');
        
        if (btnNotificar) {
            btnNotificar.addEventListener('click', () => {
                const email = emailInput.value.trim();
                if (email && validarEmail(email)) {
                    guardarNotificacion(email);
                    mostrarResultado('✅ ¡Gracias! Te notificaremos cuando FiberFast llegue a tu zona.', 'success');
                    document.querySelector('.notificacion-cobertura')?.remove();
                } else {
                    mostrarResultado('⚠️ Por favor ingresa un correo electrónico válido.', 'error');
                }
            });
        }
    }
    
    /**
     * Valida formato de email
     */
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    /**
     * Guarda la solicitud de notificación
     */
    function guardarNotificacion(email) {
        const notificaciones = JSON.parse(localStorage.getItem('fiberfast_notificaciones') || '[]');
        notificaciones.push({
            email: email,
            fecha: new Date().toISOString(),
            zona: 'pendiente'
        });
        localStorage.setItem('fiberfast_notificaciones', JSON.stringify(notificaciones));
    }
    
    /**
     * Actualiza zonas de cobertura (para administración)
     */
    function actualizarZonas(nuevasZonas) {
        ZONAS_COBERTURA.push(...nuevasZonas);
    }
    
    // API pública
    return {
        init,
        verificar: verificarCobertura,
        actualizarZonas
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CoberturaModule = CoberturaModule;
}