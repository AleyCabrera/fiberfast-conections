/**
 * Integración de Chat en Vivo y WhatsApp
 * Configuración de Tawk.to y botón flotante de WhatsApp
 */

'use strict';

const ChatIntegration = (function() {
    // Configuración
    const CONFIG = {
        // WhatsApp (reemplazar con número real)
        whatsappNumber: '573044614193',
        whatsappMessage: 'Hola FiberFast, necesito ayuda con sus servicios.',
        
        // Tawk.to (reemplazar con tus credenciales)
        tawkToId: 'tu_id_aqui',
        tawkToWidgetId: 'tu_widget_id_aqui'
    };
    
    let initialized = false;
    
    /**
     * Inicializa todas las integraciones de chat
     */
    function init() {
        if (initialized) return;
        
        inicializarWhatsApp();
        inicializarTawkTo();
        
        initialized = true;
        console.log('✅ Chat integration inicializado');
    }
    
    /**
     * Configura el botón flotante de WhatsApp
     */
    function inicializarWhatsApp() {
        // Verificar si ya existe el botón
        if (document.querySelector('.whatsapp-float-custom')) return;
        
        const whatsappButton = document.createElement('a');
        whatsappButton.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
        whatsappButton.className = 'whatsapp-float-custom';
        whatsappButton.target = '_blank';
        whatsappButton.rel = 'noopener noreferrer';
        whatsappButton.setAttribute('aria-label', 'Contactar por WhatsApp');
        whatsappButton.innerHTML = `
            <i class="fab fa-whatsapp"></i>
            <span class="whatsapp-tooltip">¿Necesitas ayuda?</span>
        `;
        
        document.body.appendChild(whatsappButton);
        
        // Estilos dinámicos
        const style = document.createElement('style');
        style.textContent = `
            .whatsapp-float-custom {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                z-index: 1000;
                animation: pulse-whatsapp 2s infinite;
            }
            
            .whatsapp-float-custom:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
            }
            
            .whatsapp-tooltip {
                position: absolute;
                right: 70px;
                background: white;
                color: #333;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .whatsapp-float-custom:hover .whatsapp-tooltip {
                opacity: 1;
                visibility: visible;
                right: 75px;
            }
            
            @keyframes pulse-whatsapp {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.5);
                }
            }
            
            @media (max-width: 768px) {
                .whatsapp-float-custom {
                    width: 50px;
                    height: 50px;
                    font-size: 1.5rem;
                    bottom: 15px;
                    right: 15px;
                }
                .whatsapp-tooltip {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Inicializa Tawk.to (chat en vivo)
     */
    function inicializarTawkTo() {
        // Solo inicializar si hay credenciales configuradas
        if (CONFIG.tawkToId === 'tu_id_aqui' || CONFIG.tawkToWidgetId === 'tu_widget_id_aqui') {
            console.log('⚠️ Tawk.to no configurado. Agrega tus credenciales en chat-integration.js');
            return;
        }
        
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://embed.tawk.to/${CONFIG.tawkToId}/${CONFIG.tawkToWidgetId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        document.head.appendChild(script);
    }
    
    /**
     * Actualiza mensaje de WhatsApp
     */
    function setWhatsAppMessage(mensaje) {
        CONFIG.whatsappMessage = mensaje;
        const button = document.querySelector('.whatsapp-float-custom');
        if (button) {
            button.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
        }
    }
    
    /**
     * Abre chat de WhatsApp con mensaje personalizado
     */
    function openWhatsApp(mensaje = CONFIG.whatsappMessage) {
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
    
    // API pública
    return {
        init,
        setWhatsAppMessage,
        openWhatsApp
    };
})();

if (typeof window !== 'undefined') {
    window.ChatIntegration = ChatIntegration;
}