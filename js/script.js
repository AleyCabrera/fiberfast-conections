/**
 * FiberFast - JavaScript Principal
 * @version 2.0.0
 * @description Script moderno y optimizado con mejores prácticas
 */

'use strict';

// ===========================================
// CONFIGURACIÓN GLOBAL
// ===========================================

const CONFIG = {
    scrollThreshold: 100,
    scrollTopVisibleAt: 300,
    animationDuration: 300,
    notificationDuration: 3000,
    observerOptions: {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    }
};

// ===========================================
// CLASE PRINCIPAL DE LA APLICACIÓN
// ===========================================

class FiberFastApp {
    constructor() {
        this.elements = this.cacheElements();
        this.state = {
            isMenuOpen: false,
            isScrolling: false
        };
        
        this.init();
    }

    /**
     * Cachea los elementos del DOM para mejor rendimiento
     */
    cacheElements() {
        return {
            hamburger: document.querySelector('.hamburger'),
            nav: document.querySelector('.nav'),
            navLinks: document.querySelectorAll('.nav-link'),
            header: document.querySelector('.header'),
            scrollTopBtn: document.querySelector('.scroll-top'),
            newsletterForm: document.querySelector('.newsletter-form'),
            animatedElements: document.querySelectorAll('.feature-card, .plan-card, .section-header'),
            body: document.body
        };
    }

    /**
     * Inicializa todos los módulos de la aplicación
     */
    init() {
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupScrollToTop();
        this.setupAnimations();
        this.setupNewsletterForm();
        this.setupAccessibility();
        this.setupSmoothScroll();
        this.setupLazyLoading();
        
        console.log('✅ FiberFast App inicializada correctamente');
    }

    // ===========================================
    // MENÚ MÓVIL
    // ===========================================

    setupMobileMenu() {
        const { hamburger, nav, navLinks, body } = this.elements;

        if (!hamburger || !nav) return;

        // Toggle menú
        hamburger.addEventListener('click', () => this.toggleMenu());

        // Cerrar menú al hacer clic en enlaces
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.state.isMenuOpen) {
                    this.closeMenu();
                }
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen && 
                !nav.contains(e.target) && 
                !hamburger.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        
        const { hamburger, nav, body } = this.elements;
        
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', this.state.isMenuOpen);
        
        // Prevenir scroll del body cuando el menú está abierto
        body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
    }

    closeMenu() {
        if (!this.state.isMenuOpen) return;
        
        this.state.isMenuOpen = false;
        const { hamburger, nav, body } = this.elements;
        
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    }

    // ===========================================
    // EFECTOS DE SCROLL
    // ===========================================

    setupScrollEffects() {
        const { header } = this.elements;
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > CONFIG.scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }

    setupScrollToTop() {
        const { scrollTopBtn } = this.elements;
        if (!scrollTopBtn) return;

        let ticking = false;

        const updateScrollTopButton = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > CONFIG.scrollTopVisibleAt) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollTopButton);
                ticking = true;
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===========================================
    // ANIMACIONES
    // ===========================================

    setupAnimations() {
        if (!('IntersectionObserver' in window)) {
            // Fallback para navegadores antiguos
            this.elements.animatedElements.forEach(el => {
                el.classList.add('fade-in');
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, CONFIG.observerOptions);

        this.elements.animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // ===========================================
    // FORMULARIO DE NEWSLETTER
    // ===========================================

    setupNewsletterForm() {
        const { newsletterForm } = this.elements;
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewsletterSubmit(newsletterForm);
        });
    }

    handleNewsletterSubmit(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showNotification(
                'Por favor, ingresa un correo electrónico válido.',
                'error'
            );
            emailInput.focus();
            return;
        }

        // Simular envío exitoso
        emailInput.value = '';
        this.showNotification(
            '¡Gracias por suscribirte! Pronto recibirás nuestras novedades.',
            'success'
        );
    }

    // ===========================================
    // SMOOTH SCROLL
    // ===========================================

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Ignorar enlaces sin destino válido
                if (href === '#' || !href) return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                // Calcular offset del header
                const headerHeight = this.elements.header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Actualizar la URL sin recargar
                history.pushState(null, '', href);
            });
        });
    }

    // ===========================================
    // LAZY LOADING
    // ===========================================

    setupLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // El navegador soporta lazy loading nativo
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback con Intersection Observer
            this.lazyLoadImages();
        }
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ===========================================
    // ACCESIBILIDAD
    // ===========================================

    setupAccessibility() {
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Navegación por teclado en el menú
        const { navLinks, hamburger } = this.elements;
        
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextLink = navLinks[index + 1] || navLinks[0];
                    nextLink.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
                    prevLink.focus();
                }
            });
        });

        // Hacer el hamburger accesible por teclado
        if (hamburger) {
            hamburger.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMenu();
                }
            });
        }
    }

    // ===========================================
    // UTILIDADES
    // ===========================================

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remover después del tiempo configurado
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), CONFIG.animationDuration);
        }, CONFIG.notificationDuration);
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        const colors = {
            success: '#28A745',
            error: '#DC3545',
            info: '#17A2B8',
            warning: '#FFC107'
        };

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ⓘ',
            warning: '⚠'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '-400px',
            minWidth: '300px',
            maxWidth: '400px',
            padding: '1rem 1.5rem',
            background: colors[type] || colors.info,
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'right 0.3s ease-out, opacity 0.3s ease-out',
            opacity: '0'
        });

        // Estilos para elementos internos
        const icon = notification.querySelector('.notification-icon');
        Object.assign(icon.style, {
            fontSize: '1.5rem',
            fontWeight: 'bold'
        });

        // Transición de entrada
        notification.classList.add('notification');
        
        return notification;
    }

    // Método para manejar errores globales
    handleError(error, context = 'General') {
        console.error(`Error en ${context}:`, error);
        this.showNotification(
            'Ha ocurrido un error. Por favor, intenta nuevamente.',
            'error'
        );
    }
}

// ===========================================
// MÓDULO DE PERFORMANCE MONITORING (Opcional)
// ===========================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        if ('PerformanceObserver' in window) {
            this.observePaint();
            this.observeResources();
        }
    }

    observePaint() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics[entry.name] = entry.startTime;
            }
        });
        observer.observe({ entryTypes: ['paint'] });
    }

    observeResources() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 1000) {
                    console.warn(`Recurso lento: ${entry.name} (${entry.duration}ms)`);
                }
            }
        });
        observer.observe({ entryTypes: ['resource'] });
    }

    getMetrics() {
        return this.metrics;
    }
}

// ===========================================
// INICIALIZACIÓN
// ===========================================

// Esperar a que el DOM esté completamente cargado
function initApp() {
    try {
        // Inicializar aplicación principal
        if (typeof FiberFastApp !== 'undefined') {
            window.fiberFastApp = new FiberFastApp();
            console.log('✅ FiberFastApp inicializada');
        } else {
            console.warn('⚠️ FiberFastApp no encontrado');
        }

        // Inicializar monitor de performance (solo en desarrollo)
        if ((window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' || 
             window.location.hostname === '192.168.0.') && 
            typeof PerformanceMonitor !== 'undefined') {
            window.performanceMonitor = new PerformanceMonitor();
            console.log('📊 Performance Monitor activado (modo desarrollo)');
        }

        // Array de módulos a inicializar (más fácil de mantener)
        const modules = [
            { name: 'CoberturaModule', obj: window.CoberturaModule, description: 'Verificador de cobertura' },
            { name: 'SolicitudModule', obj: window.SolicitudModule, description: 'Formulario de solicitud' },
            { name: 'FAQModule', obj: window.FAQModule, description: 'Preguntas frecuentes' },
            { name: 'TicketsModule', obj: window.TicketsModule, description: 'Sistema de tickets' },
            { name: 'ChatIntegration', obj: window.ChatIntegration, description: 'Chat y WhatsApp' }
        ];

        // Inicializar todos los módulos
        let initializedCount = 0;
        
        modules.forEach(module => {
            if (module.obj && typeof module.obj.init === 'function') {
                try {
                    module.obj.init();
                    initializedCount++;
                    console.log(`✅ ${module.description} inicializado`);
                } catch (moduleError) {
                    console.error(`❌ Error al inicializar ${module.description}:`, moduleError);
                }
            } else if (module.obj && typeof module.obj.init !== 'function') {
                console.warn(`⚠️ ${module.name} no tiene método init()`);
            } else {
                console.log(`ℹ️ ${module.name} no disponible (no implementado aún)`);
            }
        });

        console.log(`✅ ${initializedCount}/${modules.length} módulos inicializados correctamente`);

        // Evento personalizado para notificar que la app está lista
        const appReadyEvent = new CustomEvent('fiberfast:ready', {
            detail: { 
                modules: initializedCount,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(appReadyEvent);

    } catch (error) {
        console.error('❌ Error crítico al inicializar la aplicación:', error);
        
        // Mostrar mensaje amigable al usuario (opcional)
        if (window.fiberFastApp && window.fiberFastApp.showNotification) {
            window.fiberFastApp.showNotification(
                'Hubo un problema al cargar algunas funciones. Recarga la página si el problema persiste.',
                'error'
            );
        }
    }
}

// Asegurar que el DOM esté cargado antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM ya está cargado, inicializar inmediatamente
    initApp();
}

// CSS adicional para notificaciones
const style = document.createElement('style');
style.textContent = `
    .notification.show {
        right: 20px !important;
        opacity: 1 !important;
    }

    @media (max-width: 480px) {
        .notification {
            right: -100% !important;
            left: 10px;
            min-width: auto !important;
            max-width: calc(100vw - 20px) !important;
        }
        
        .notification.show {
            right: 10px !important;
        }
    }
`;
document.head.appendChild(style);

// Prevenir comportamiento por defecto de formularios vacíos
document.querySelectorAll('form:not(.newsletter-form)').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.fiberFastApp?.showNotification(
            'Formulario enviado correctamente. ¡Gracias por contactarnos!',
            'success'
        );
    });
});

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FiberFastApp, PerformanceMonitor };
}