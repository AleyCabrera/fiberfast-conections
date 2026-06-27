/**
 * ===========================================
 * FIBERFAST DASHBOARD - CLIENTE
 * Archivo principal de JavaScript
 * Versión: 3.0.0 - Conectado al Backend
 * ===========================================
 */

class FiberFastDashboard {
    constructor() {
        // Propiedades de estado
        this.userData = null;
        this.dashboardStats = null;
        this.notifications = [];
        this.currentTooltip = null;
        this.refreshIntervals = [];
        
        this.init();
    }

    /**
     * ===========================================
     * INICIALIZACIÓN PRINCIPAL
     * ===========================================
     */
    async init() {
        try {
            // Verificar autenticación primero
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                return;
            }

            this.cacheDOM();
            this.bindEvents();
            
            // Cargar datos del usuario y dashboard
            await this.loadUserData();
            
            // Inicializar módulos
            this.initAnimations();
            this.initCharts();
            this.initTooltips();
            this.initNotifications();
            this.initSessionMonitor();
            this.startRealTimeUpdates();
            
            console.log('✅ Dashboard FiberFast inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
            this.showError('Error al cargar el dashboard. Por favor, recarga la página.');
        }
    }

    /**
     * ===========================================
     * AUTENTICACIÓN Y SESIÓN
     * ===========================================
     */
    
    /**
     * Verifica si el usuario está autenticado
     */
    async checkAuthentication() {
        const token = localStorage.getItem('fiberfast_token');
        
        if (!token) {
            this.redirectToLogin('Sesión no iniciada');
            return false;
        }

        try {
            // Verificar token con el backend
            const response = await apiGet(API_CONFIG.AUTH.PROFILE);
            if (!response.success) {
                this.redirectToLogin('Sesión inválida');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            if (error.message === 'Sesión expirada' || error.message.includes('401')) {
                this.redirectToLogin('Sesión expirada');
                return false;
            }
            return false;
        }
    }

    /**
     * Redirige al login
     */
    redirectToLogin(reason = '') {
        console.warn(`🔒 Redirigiendo al login: ${reason}`);
        localStorage.removeItem('fiberfast_token');
        localStorage.removeItem('fiberfast_user');
        localStorage.removeItem('fiberfast_remember');
        window.location.href = '/page/portal-cliente.html';
    }

    /**
     * ===========================================
     * CARGA DE DATOS
     * ===========================================
     */
    
    /**
     * Carga todos los datos del usuario y dashboard
     */
    async loadUserData() {
        try {
            // Cargar perfil del usuario
            const profile = await apiGet(API_CONFIG.AUTH.PROFILE);
            if (profile.success) {
                this.userData = profile.user;
                this.updateUserUI(profile.user);
            }

            // Cargar estadísticas del dashboard
            const stats = await apiGet(API_CONFIG.ADMIN.STATS);
            if (stats.success) {
                this.dashboardStats = stats.stats;
                this.updateDashboardUI(stats.stats);
            }

            // Cargar tickets recientes
            await this.loadRecentTickets();

        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            this.showError('Error al cargar los datos. Mostrando información local.');
            
            // Fallback a datos de prueba si hay error
            this.loadFallbackData();
        }
    }

    /**
     * Carga tickets recientes para mostrar en el dashboard
     */
    async loadRecentTickets() {
        try {
            const response = await apiGet(API_CONFIG.TICKETS.MY_TICKETS);
            if (response.success && response.tickets) {
                const recentTickets = response.tickets.slice(0, 2);
                this.updateTicketsUI(recentTickets);
            }
        } catch (error) {
            console.warn('No se pudieron cargar los tickets:', error.message);
        }
    }

    /**
     * Carga datos de fallback si la API falla
     */
    loadFallbackData() {
        console.log('📋 Cargando datos de fallback...');
        
        // Datos simulados para desarrollo
        const fallbackUser = {
            id: 1,
            nombre: 'Usuario Demo',
            email: 'demo@fiberfast.com.co',
            telefono: '3001234567',
            tipo_cliente: 'residencial'
        };
        
        const fallbackStats = {
            usuarios: { total: 1250, activos: 987 },
            solicitudes: { total: 45, pendientes: 12 },
            tickets: { total: 23, abiertos: 8 },
            database: 'memory'
        };
        
        this.updateUserUI(fallbackUser);
        this.updateDashboardUI(fallbackStats);
        this.showToast('Mostrando datos de demostración', 'warning');
    }

    /**
     * ===========================================
     * ACTUALIZACIÓN DE UI
     * ===========================================
     */
    
    /**
     * Actualiza la interfaz con los datos del usuario
     */
    updateUserUI(user) {
        // Actualizar nombre en el welcome
        const welcomeTitle = document.querySelector('.welcome-box h1');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Hola ${user.nombre} 👋`;
        }

        // Actualizar email en el welcome si existe
        const welcomeSubtitle = document.querySelector('.welcome-box p');
        if (welcomeSubtitle && user.email) {
            welcomeSubtitle.textContent = `${user.email} • Cliente ${user.tipo_cliente || 'residencial'}`;
        }

        // Actualizar badge del usuario
        const userBadge = document.querySelector('.user-badge');
        if (userBadge) {
            const initials = user.nombre
                .split(' ')
                .filter(n => n.length > 0)
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            userBadge.textContent = initials;
            userBadge.title = user.nombre;
        }

        // Actualizar plan badge
        const planBadge = document.querySelector('.plan-badge strong');
        if (planBadge && this.dashboardStats) {
            // Si tenemos datos de usuarios activos, mostrar algo relacionado
            const activeUsers = this.dashboardStats.usuarios?.activos || 0;
            planBadge.textContent = `${activeUsers} Activos`;
        }
    }

    /**
     * Actualiza el dashboard con estadísticas reales
     */
    updateDashboardUI(stats) {
        if (!stats) return;

        const statCards = document.querySelectorAll('.stat-card');
        
        // Mapear estadísticas a las cards
        const statMappings = [
            { icon: 'fa-wallet', label: 'Usuarios Activos', value: stats.usuarios?.activos || 0 },
            { icon: 'fa-check-circle', label: 'Servicios Activos', value: stats.usuarios?.total || 0 },
            { icon: 'fa-calendar-alt', label: 'Solicitudes', value: stats.solicitudes?.total || 0 },
            { icon: 'fa-gauge-high', label: 'Tickets Abiertos', value: stats.tickets?.abiertos || 0 }
        ];

        statCards.forEach((card, index) => {
            const valueEl = card.querySelector('h2');
            const labelEl = card.querySelector('span');
            
            if (valueEl && index < statMappings.length) {
                const targetValue = statMappings[index].value;
                this.animateCounter(valueEl, targetValue);
            }
            
            if (labelEl && index < statMappings.length) {
                labelEl.textContent = statMappings[index].label;
            }
        });

        // Actualizar el badge del plan con el total de usuarios
        const planBadge = document.querySelector('.plan-badge strong');
        if (planBadge) {
            const totalUsers = stats.usuarios?.total || 0;
            planBadge.textContent = `${totalUsers} Usuarios`;
        }
    }

    /**
     * Actualiza la sección de tickets recientes
     */
    updateTicketsUI(tickets) {
        const ticketsContainer = document.querySelector('.tickets-container');
        if (!ticketsContainer) return;

        if (!tickets || tickets.length === 0) {
            ticketsContainer.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No tienes tickets de soporte activos.</p>
                </div>
            `;
            return;
        }

        ticketsContainer.innerHTML = tickets.map(ticket => `
            <div class="ticket-card ${ticket.estado}">
                <div class="ticket-header">
                    <span class="ticket-id">#${ticket.id}</span>
                    <span class="ticket-status ${ticket.estado}">
                        ${this.getEstadoTexto(ticket.estado)}
                    </span>
                </div>
                <div class="ticket-title">${this.escapeHtml(ticket.asunto)}</div>
                <div class="ticket-date">
                    ${new Date(ticket.created_at).toLocaleDateString('es-CO')}
                </div>
            </div>
        `).join('');
    }

    /**
     * ===========================================
     * ANIMACIONES MEJORADAS
     * ===========================================
     */
    
    initAnimations() {
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initTypingEffect();
    }

    /**
     * Animaciones al hacer scroll (Intersection Observer)
     */
    initScrollAnimations() {
        if (!('IntersectionObserver' in window)) return;

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

        document.querySelectorAll('.card, .welcome-box, .invoice-info').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    /**
     * Animaciones hover avanzadas
     */
    initHoverAnimations() {
        if (!this.$cards) return;

        this.$cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleCardHover(e, card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
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

    /**
     * Efecto de typing para el welcome message
     */
    initTypingEffect() {
        const welcomeText = document.querySelector('.welcome-box h1');
        if (!welcomeText || !this.userData) return;

        const name = this.userData.nombre || 'Usuario';
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
     * ===========================================
     * GRÁFICAS (Simplificadas pero funcionales)
     * ===========================================
     */
    
    initCharts() {
        this.createSpeedChart();
    }

    createSpeedChart() {
        const container = document.querySelector('[data-chart="speed"]');
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'speedChart';
        canvas.width = container.clientWidth || 400;
        canvas.height = 150;
        canvas.style.width = '100%';
        canvas.style.height = '150px';
        container.appendChild(canvas);

        // Dibujar gráfica simple con datos simulados
        const ctx = canvas.getContext('2d');
        this.drawSpeedChart(ctx, canvas.width, canvas.height);
    }

    drawSpeedChart(ctx, width, height) {
        const padding = 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const points = 20;
        const data = [];

        // Generar datos simulados de velocidad
        for (let i = 0; i < points; i++) {
            const base = 600 + Math.sin(i / 3) * 200;
            data.push(base + Math.random() * 100);
        }

        // Limpiar
        ctx.clearRect(0, 0, width, height);

        // Dibujar gradiente de fondo
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(79, 82, 140, 0.3)');
        gradient.addColorStop(1, 'rgba(79, 82, 140, 0.02)');

        ctx.beginPath();
        const maxValue = Math.max(...data) * 1.1;
        const minValue = Math.min(...data) * 0.9;

        data.forEach((value, index) => {
            const x = padding + (index / (points - 1)) * chartWidth;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        // Área bajo la curva
        const lastX = padding + chartWidth;
        const firstX = padding;
        ctx.lineTo(lastX, padding + chartHeight);
        ctx.lineTo(firstX, padding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Dibujar línea
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding + (index / (points - 1)) * chartWidth;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = '#4F528C';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar puntos
        data.forEach((value, index) => {
            const x = padding + (index / (points - 1)) * chartWidth;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#4F528C';
            ctx.fill();
        });

        // Valor actual
        const currentSpeed = Math.round(data[data.length - 1]);
        ctx.fillStyle = '#4F528C';
        ctx.font = 'bold 14px Poppins, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${currentSpeed} Mbps`, width - padding, padding - 10);
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
     * NOTIFICACIONES
     * ===========================================
     */
    
    initNotifications() {
        this.createNotificationBell();
    }

    createNotificationBell() {
        const bell = document.createElement('div');
        bell.className = 'notification-bell';
        bell.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge" id="notification-count">0</span>
        `;
        
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            userActions.insertBefore(bell, userActions.firstChild);
        }
        
        bell.addEventListener('click', () => this.toggleNotifications());
        
        // Cargar notificaciones reales si existen
        this.loadNotifications();
    }

    async loadNotifications() {
        try {
            // Intentar obtener notificaciones del backend
            // Por ahora simulamos algunas
            const mockNotifications = [
                { id: 1, type: 'info', message: 'Bienvenido a FiberFast', time: 'Ahora' },
                { id: 2, type: 'success', message: 'Tu servicio está activo', time: 'Hace 1 día' }
            ];
            
            this.notifications = mockNotifications;
            this.updateNotificationBadge();
        } catch (error) {
            console.warn('No se pudieron cargar notificaciones:', error.message);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-count');
        if (badge) {
            badge.textContent = this.notifications.length || 0;
        }
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
                <button class="mark-all-read" id="mark-all-read">✓ Marcar todas como leídas</button>
            </div>
            <div class="notification-list">
                ${this.notifications.length === 0 ? 
                    '<div class="no-notifications"><p>No tienes notificaciones</p></div>' :
                    this.notifications.map(n => `
                        <div class="notification-item ${n.type}">
                            <div class="notification-content">
                                <p>${this.escapeHtml(n.message)}</p>
                                <small>${n.time}</small>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Marcar como leídas
        panel.querySelector('#mark-all-read')?.addEventListener('click', () => {
            this.notifications = [];
            this.updateNotificationBadge();
            panel.classList.remove('visible');
            this.showToast('Todas las notificaciones marcadas como leídas', 'success');
        });
        
        return panel;
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
    
    startRealTimeUpdates() {
        // Actualizar velocidad cada 30 segundos
        const interval = setInterval(() => {
            this.updateSpeedData();
        }, 30000);
        this.refreshIntervals.push(interval);
    }

    updateSpeedData() {
        const speedElement = document.querySelector('.stat-card:last-child h2');
        if (!speedElement) return;
        
        // Simular actualización de velocidad con datos realistas
        const baseSpeed = 750;
        const variation = Math.floor(Math.random() * 40) - 20;
        const newSpeed = Math.max(100, baseSpeed + variation);
        speedElement.innerText = `${newSpeed} Mbps`;
        
        // Mostrar notificación si hay cambio significativo
        if (Math.abs(variation) > 15) {
            this.showToast(`Velocidad actual: ${newSpeed} Mbps`, 'info');
        }
    }

    /**
     * ===========================================
     * MANEJO DE SESIÓN
     * ===========================================
     */
    
    initSessionMonitor() {
        this.lastActivity = Date.now();
        
        // Monitorear actividad del usuario
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            });
        });
        
        // Verificar inactividad cada minuto
        setInterval(() => {
            const inactiveTime = Date.now() - this.lastActivity;
            if (inactiveTime > 1800000) { // 30 minutos
                this.autoLogout('Inactividad prolongada');
            }
        }, 60000);
    }

    autoLogout(reason = 'Sesión expirada') {
        this.showToast(`🔒 ${reason}`, 'warning');
        
        setTimeout(() => {
            localStorage.removeItem('fiberfast_token');
            localStorage.removeItem('fiberfast_user');
            window.location.href = '/page/portal-cliente.html';
        }, 3000);
    }

    /**
     * ===========================================
     * HANDLERS DE EVENTOS
     * ===========================================
     */
    
    cacheDOM() {
        this.$body = document.body;
        this.$header = document.querySelector('.portal-header');
        this.$navLinks = document.querySelectorAll('.portal-nav a');
        this.$userBadge = document.querySelector('.user-badge');
        this.$logoutBtn = document.querySelector('.btn-logout');
        this.$cards = document.querySelectorAll('.card');
    }

    bindEvents() {
        // Navegación
        this.$navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Logout
        if (this.$logoutBtn) {
            this.$logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // User badge
        if (this.$userBadge) {
            this.$userBadge.addEventListener('click', () => this.toggleUserMenu());
        }

        // Scroll
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());

        // Cerrar menús al hacer clic fuera
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Tecla ESC para cerrar menús
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllMenus();
            }
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const link = e.currentTarget;
        
        this.$navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
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
        
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            this.showToast('Cerrando sesión...', 'info');
            
            // Limpiar localStorage
            localStorage.removeItem('fiberfast_token');
            localStorage.removeItem('fiberfast_user');
            localStorage.removeItem('fiberfast_remember');
            localStorage.removeItem('lastActivity');
            
            // Detener intervalos
            this.refreshIntervals.forEach(interval => clearInterval(interval));
            
            // Redirigir al login
            setTimeout(() => {
                window.location.href = '/page/portal-cliente.html';
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
        
        const userName = this.userData?.nombre || 'Usuario';
        const userEmail = this.userData?.email || '';
        
        menu.innerHTML = `
            <div class="user-menu-header">
                <strong>${this.escapeHtml(userName)}</strong>
                <small>${this.escapeHtml(userEmail)}</small>
            </div>
            <ul>
                <li data-action="profile"><i class="fas fa-user"></i> Mi Perfil</li>
                <li data-action="settings"><i class="fas fa-cog"></i> Configuración</li>
                <li data-action="security"><i class="fas fa-shield-alt"></i> Seguridad</li>
                <li data-action="help"><i class="fas fa-question-circle"></i> Ayuda</li>
                <li class="logout-menu" data-action="logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</li>
            </ul>
        `;
        
        document.body.appendChild(menu);
        
        // Posicionar menú
        const rect = this.$userBadge.getBoundingClientRect();
        menu.style.top = rect.bottom + 10 + 'px';
        menu.style.right = window.innerWidth - rect.right + 'px';
        
        // Eventos de menú
        menu.querySelectorAll('li[data-action]').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action === 'logout') {
                    this.handleLogout(new Event('click'));
                } else if (action === 'profile') {
                    this.showToast('Perfil de usuario', 'info');
                } else if (action === 'settings') {
                    this.showToast('Configuración', 'info');
                } else if (action === 'security') {
                    this.showToast('Seguridad', 'info');
                } else if (action === 'help') {
                    this.showToast('Ayuda disponible en nuestro sitio web', 'info');
                }
                menu.classList.remove('visible');
            });
        });
        
        return menu;
    }

    handleOutsideClick(e) {
        const userMenu = document.querySelector('.user-menu');
        const notificationPanel = document.querySelector('.notification-panel');
        
        if (userMenu && !userMenu.contains(e.target) && !this.$userBadge?.contains(e.target)) {
            userMenu.classList.remove('visible');
        }
        
        if (notificationPanel && !notificationPanel.contains(e.target) && !e.target.closest('.notification-bell')) {
            notificationPanel.classList.remove('visible');
        }
    }

    closeAllMenus() {
        document.querySelectorAll('.user-menu, .notification-panel').forEach(el => {
            el.classList.remove('visible');
        });
    }

    handleScroll() {
        if (this.$header) {
            if (window.scrollY > 50) {
                this.$header.classList.add('header-scrolled');
            } else {
                this.$header.classList.remove('header-scrolled');
            }
        }
    }

    handleResize() {
        // Reajustar gráfica si es necesario
        const canvas = document.getElementById('speedChart');
        if (canvas) {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth || 400;
            }
        }
    }

    /**
     * ===========================================
     * UTILIDADES
     * ===========================================
     */
    
    animateCounter(element, target) {
        if (!element || isNaN(target)) return;
        
        let current = 0;
        const steps = 30;
        const increment = target / steps;
        const duration = 1000;
        const stepTime = duration / steps;
        
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

    getEstadoTexto(estado) {
        const estados = {
            'abierto': 'Abierto',
            'en_proceso': 'En Proceso',
            'resuelto': 'Resuelto',
            'cerrado': 'Cerrado'
        };
        return estados[estado] || estado;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        this.showToast(`❌ ${message}`, 'error');
    }
}

/**
 * ===========================================
 * INICIALIZACIÓN
 * ===========================================
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FiberFastDashboard();
    });
} else {
    new FiberFastDashboard();
}