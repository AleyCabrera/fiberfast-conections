/**
 * ===========================================
 * FIBERFAST DASHBOARD - CLIENTE
 * Archivo principal de JavaScript
 * Versión: 2.0.0
 * ===========================================
 */

class FiberFastDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initAnimations();
        this.initCharts();
        this.initTooltips();
        this.initNotifications();
        this.checkUserSession();
        this.loadRealTimeData();
        console.log('✅ Dashboard FiberFast inicializado correctamente');
    }

    /**
     * Cache de elementos DOM
     */
    cacheDOM() {
        this.$body = document.body;
        this.$header = document.querySelector('.portal-header');
        this.$navLinks = document.querySelectorAll('.portal-nav a');
        this.$userBadge = document.querySelector('.user-badge');
        this.$logoutBtn = document.querySelector('.btn-logout');
        this.$cards = document.querySelectorAll('.card');
        this.$welcomeBox = document.querySelector('.welcome-box');
        this.$dashboardGrid = document.querySelector('.dashboard-grid');
    }

    /**
     * Event Listeners
     */
    bindEvents() {
        // Navegación activa
        this.$navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Logout
        if (this.$logoutBtn) {
            this.$logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // User badge click (perfil)
        if (this.$userBadge) {
            this.$userBadge.addEventListener('click', () => this.toggleUserMenu());
        }

        // Scroll events
        window.addEventListener('scroll', () => this.handleScroll());

        // Resize events
        window.addEventListener('resize', () => this.handleResize());

        // Clicks externos para cerrar menús
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    /**
     * ===========================================
     * ANIMACIONES MEJORADAS
     * ===========================================
     */
    initAnimations() {
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initNumberCounters();
        this.initTypingEffect();
    }

    /**
     * Animaciones al hacer scroll (Intersection Observer)
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar todas las cards y elementos principales
        document.querySelectorAll('.card, .welcome-box, .invoice-info').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    /**
     * Efecto de contador para números (estadísticas)
     */
    initNumberCounters() {
        const counters = document.querySelectorAll('.stat-card h2');
        
        counters.forEach(counter => {
            const target = parseInt(counter.innerText.replace(/[^0-9]/g, ''));
            if (!isNaN(target)) {
                this.animateCounter(counter, target);
            }
        });
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50; // 50 pasos
        const duration = 1500; // 1.5 segundos
        const stepTime = duration / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.innerText = this.formatNumber(target);
                clearInterval(timer);
            } else {
                element.innerText = this.formatNumber(Math.floor(current));
            }
        }, stepTime);
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Efecto de typing para el welcome message
     */
    initTypingEffect() {
        const welcomeText = document.querySelector('.welcome-box h1');
        if (!welcomeText) return;

        const originalText = welcomeText.innerText;
        if (originalText.includes('👋')) return; // Ya tiene el emoji

        const name = 'Kevin';
        const phrases = [
            `¡Hola ${name}! 👋`,
            `Bienvenido ${name} ✨`,
            `Qué gusto verte ${name} 🌟`
        ];
        
        let phraseIndex = 0;
        
        setInterval(() => {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            this.typeEffect(welcomeText, phrases[phraseIndex]);
        }, 5000);
    }

    typeEffect(element, text, speed = 50) {
        let i = 0;
        element.innerText = '';
        
        const typing = setInterval(() => {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, speed);
    }

    /**
     * Animaciones hover avanzadas
     */
    initHoverAnimations() {
        // Efecto de brillo en cards
        this.$cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleCardHover(e, card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
        });

        // Efecto de partículas en botones
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', (e) => this.createParticles(e, btn));
        });
    }

    handleCardHover(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    }

    handleCardLeave(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    }

    createParticles(e, btn) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('span');
            particle.className = 'btn-particle';
            particle.style.left = e.clientX - btn.getBoundingClientRect().left + 'px';
            particle.style.top = e.clientY - btn.getBoundingClientRect().top + 'px';
            particle.style.animation = `particle 1s ease-out ${i * 0.1}s`;
            btn.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    /**
     * ===========================================
     * GRÁFICAS Y DATOS
     * ===========================================
     */
    initCharts() {
        this.createSpeedChart();
        this.createUsageChart();
        this.createPaymentHistory();
    }

    createSpeedChart() {
        const canvas = document.createElement('canvas');
        canvas.id = 'speedChart';
        canvas.width = 400;
        canvas.height = 200;
        
        const card = document.querySelector('[data-chart="speed"]');
        if (card) {
            card.appendChild(canvas);
            
            // Datos de velocidad simulados
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(79, 82, 140, 0.8)');
            gradient.addColorStop(1, 'rgba(79, 82, 140, 0.1)');
            
            // Aquí iría la implementación real de Chart.js o similar
            this.drawDummyChart(ctx, gradient);
        }
    }

    drawDummyChart(ctx, gradient) {
        // Implementación simplificada
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 200);
    }

    createUsageChart() {
        // Implementar gráfica de uso
    }

    createPaymentHistory() {
        // Implementar historial de pagos
    }

    /**
     * ===========================================
     * TOOLTIPS Y POPOVERS
     * ===========================================
     */
    initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }

    showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.innerText = e.target.dataset.tooltip;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        setTimeout(() => tooltip.classList.add('visible'), 10);
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    /**
     * ===========================================
     * NOTIFICACIONES EN TIEMPO REAL
     * ===========================================
     */
    initNotifications() {
        this.notifications = [];
        this.createNotificationBell();
        this.simulateRealtimeNotifications();
    }

    createNotificationBell() {
        const bell = document.createElement('div');
        bell.className = 'notification-bell';
        bell.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
        `;
        
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            userActions.insertBefore(bell, userActions.firstChild);
        }
        
        bell.addEventListener('click', () => this.toggleNotifications());
    }

    toggleNotifications() {
        const panel = document.querySelector('.notification-panel') || this.createNotificationPanel();
        panel.classList.toggle('visible');
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h4>Notificaciones</h4>
                <button class="mark-all-read">✓ Marcar todas como leídas</button>
            </div>
            <div class="notification-list">
                ${this.generateNotificationItems()}
            </div>
        `;
        
        document.body.appendChild(panel);
        return panel;
    }

    generateNotificationItems() {
        const notifications = [
            { type: 'payment', message: 'Tu factura está próxima a vencer', time: '2 horas', icon: '💰' },
            { type: 'speed', message: 'Velocidad mejorada a 800 Mbps', time: '1 día', icon: '⚡' },
            { type: 'support', message: 'Ticket de soporte #1234 respondido', time: '2 días', icon: '🎫' }
        ];
        
        return notifications.map(n => `
            <div class="notification-item ${n.type}">
                <span class="notification-icon">${n.icon}</span>
                <div class="notification-content">
                    <p>${n.message}</p>
                    <small>Hace ${n.time}</small>
                </div>
            </div>
        `).join('');
    }

    simulateRealtimeNotifications() {
        // Simular notificaciones en tiempo real
        setInterval(() => {
            this.showToast('¡Nueva oferta! 50% de descuento en tu próximo mes');
        }, 30000); // Cada 30 segundos
    }

    /**
     * ===========================================
     * TOAST NOTIFICATIONS
     * ===========================================
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('visible'), 100);
        
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        });
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('visible');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * ===========================================
     * DATOS EN TIEMPO REAL
     * ===========================================
     */
    loadRealTimeData() {
        this.updateSpeedData();
        this.updatePaymentData();
    }

    updateSpeedData() {
        const speedElement = document.querySelector('.stat-card:last-child h2');
        if (!speedElement) return;
        
        // Simular actualización de velocidad
        setInterval(() => {
            const baseSpeed = 750;
            const variation = Math.floor(Math.random() * 20) - 10;
            const newSpeed = baseSpeed + variation;
            speedElement.innerText = `${newSpeed} Mbps`;
            
            if (Math.abs(variation) > 5) {
                this.showToast(`Velocidad actual: ${newSpeed} Mbps`, 'info');
            }
        }, 10000);
    }

    updatePaymentData() {
        // Actualizar datos de pago
    }

    /**
     * ===========================================
     * MANEJO DE SESIÓN
     * ===========================================
     */
    checkUserSession() {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = new Date().getTime();
        
        if (lastActivity && (now - parseInt(lastActivity)) > 3600000) { // 1 hora
            this.autoLogout();
        }
        
        // Actualizar última actividad
        document.addEventListener('mousemove', () => {
            localStorage.setItem('lastActivity', now.toString());
        });
    }

    autoLogout() {
        this.showToast('Sesión expirada por inactividad', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 3000);
    }

    /**
     * ===========================================
     * HANDLERS DE EVENTOS
     * ===========================================
     */
    handleNavClick(e) {
        e.preventDefault();
        const link = e.currentTarget;
        
        // Remover active de todos
        this.$navLinks.forEach(l => l.classList.remove('active'));
        
        // Agregar active al clickeado
        link.classList.add('active');
        
        // Scroll suave a la sección
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    handleLogout(e) {
        e.preventDefault();
        
        // Mostrar confirmación
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            this.showToast('Cerrando sesión...', 'info');
            
            // Limpiar localStorage
            localStorage.removeItem('userSession');
            localStorage.removeItem('lastActivity');
            
            // Redirigir al login
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
    }

    toggleUserMenu() {
        const menu = document.querySelector('.user-menu') || this.createUserMenu();
        menu.classList.toggle('visible');
    }

    createUserMenu() {
        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <ul>
                <li><i class="fas fa-user"></i> Mi Perfil</li>
                <li><i class="fas fa-cog"></i> Configuración</li>
                <li><i class="fas fa-shield-alt"></i> Seguridad</li>
                <li><i class="fas fa-question-circle"></i> Ayuda</li>
                <li class="logout-menu"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</li>
            </ul>
        `;
        
        document.body.appendChild(menu);
        
        // Posicionar menú
        const rect = this.$userBadge.getBoundingClientRect();
        menu.style.top = rect.bottom + 10 + 'px';
        menu.style.right = window.innerWidth - rect.right + 'px';
        
        return menu;
    }

    handleOutsideClick(e) {
        // Cerrar menús al hacer click fuera
        const userMenu = document.querySelector('.user-menu');
        const notificationPanel = document.querySelector('.notification-panel');
        
        if (userMenu && !userMenu.contains(e.target) && !this.$userBadge.contains(e.target)) {
            userMenu.classList.remove('visible');
        }
        
        if (notificationPanel && !notificationPanel.contains(e.target) && !e.target.closest('.notification-bell')) {
            notificationPanel.classList.remove('visible');
        }
    }

    handleScroll() {
        // Cambiar estilo del header al hacer scroll
        if (window.scrollY > 50) {
            this.$header.classList.add('header-scrolled');
        } else {
            this.$header.classList.remove('header-scrolled');
        }
    }

    handleResize() {
        // Ajustar elementos responsivos
        this.adjustForMobile();
    }

    adjustForMobile() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.stat-card').forEach(card => {
                card.classList.add('mobile-view');
            });
        } else {
            document.querySelectorAll('.stat-card').forEach(card => {
                card.classList.remove('mobile-view');
            });
        }
    }
}

/**
 * ===========================================
 * INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO
 * ===========================================
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FiberFastDashboard();
    });
} else {
    new FiberFastDashboard();
}