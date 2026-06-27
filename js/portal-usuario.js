/**
 * Portal de Usuario - Login
 * Conectado al backend de FiberFast
 */

'use strict';

// Navegación móvil
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Scroll to top
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Configurar el formulario de login
    const loginForm = document.querySelector('.left form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Maneja el envío del formulario de login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.querySelector('.left input[type="email"]')?.value.trim();
    const password = document.querySelector('.left input[type="password"]')?.value.trim();
    const rememberMe = document.querySelector('.left input[type="checkbox"]')?.checked;
    
    if (!email || !password) {
        mostrarErrorLogin('Por favor ingresa tu correo y contraseña.');
        return;
    }
    
    // Mostrar loading
    const btnLogin = document.querySelector('.btn-login');
    const originalText = btnLogin?.textContent;
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
    }
    
    try {
        const response = await apiPost(API_CONFIG.AUTH.LOGIN, {
            email,
            password
        });
        
        if (response.success && response.token) {
            // Guardar token y datos del usuario
            localStorage.setItem('fiberfast_token', response.token);
            localStorage.setItem('fiberfast_user', JSON.stringify(response.user));
            
            if (rememberMe) {
                localStorage.setItem('fiberfast_remember', 'true');
            }
            
            // Redirigir al dashboard
            window.location.href = '/page/dashboard.html';
        } else {
            mostrarErrorLogin(response.message || 'Credenciales inválidas.');
        }
    } catch (error) {
        console.error('Error en login:', error);
        mostrarErrorLogin('Error al iniciar sesión. Por favor, intenta nuevamente.');
    }
    
    // Restaurar botón
    if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.textContent = originalText;
    }
}

/**
 * Muestra error en el login
 */
function mostrarErrorLogin(mensaje) {
    // Buscar o crear elemento de error
    let errorEl = document.querySelector('.login-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'login-error';
        errorEl.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
            display: none;
        `;
        const form = document.querySelector('.left form');
        if (form) {
            form.insertBefore(errorEl, form.querySelector('button'));
        }
    }
    
    errorEl.textContent = mensaje;
    errorEl.style.display = 'block';
    
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// Modales existentes
function openPaymentModal() {
    document.getElementById('payment-modal').style.display = 'block';
}

function openSupportModal() {
    document.getElementById('support-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Verificar si el usuario ya está logueado
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('fiberfast_token');
    const currentPage = window.location.pathname;
    
    // Si está en la página de login y tiene token, redirigir al dashboard
    if (token && currentPage.includes('portal-cliente.html')) {
        window.location.href = '/page/dashboard.html';
    }
});