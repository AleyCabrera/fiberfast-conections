/**
 * Registro de Usuarios - FiberFast
 * Conectado al backend
 * Versión: 2.0.0
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', handleRegister);
        console.log('✅ Formulario de registro inicializado');
    }
    
    // Toggle contraseña
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                const isPassword = target.type === 'password';
                target.type = isPassword ? 'text' : 'password';
                this.textContent = isPassword ? '🙈' : '👁️';
            }
        });
    });
});

/**
 * Maneja el envío del formulario de registro
 */
async function handleRegister(e) {
    e.preventDefault();
    
    console.log('📝 Iniciando proceso de registro...');
    
    const btnRegister = document.querySelector('.btn-register');
    const originalText = btnRegister?.textContent || 'Registrarme';
    
    try {
        // Validar términos y condiciones
        const terminos = document.getElementById('terminos');
        if (!terminos || !terminos.checked) {
            mostrarErrorCampo('terminos', 'Debes aceptar los términos y condiciones');
            return;
        }
        
        // Obtener datos del formulario
        const datos = {
            nic: document.getElementById('nic')?.value?.trim() || '',
            nombre: document.getElementById('nombre')?.value?.trim() || '',
            apellido: document.getElementById('apellido')?.value?.trim() || '',
            email: document.getElementById('correo')?.value?.trim() || '',
            password: document.getElementById('password')?.value || '',
            telefono: document.getElementById('telefono')?.value?.trim() || '',
            direccion: document.getElementById('direccion')?.value?.trim() || '',
            tipo_cliente: 'residencial'
        };
        
        console.log('📤 Datos a enviar:', { ...datos, password: '******' });
        
        // Validar campos obligatorios
        if (!validarRegistro(datos)) {
            return;
        }
        
        // Mostrar loading
        if (btnRegister) {
            btnRegister.disabled = true;
            btnRegister.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        }
        
        // Enviar al backend
        const response = await apiPost(API_CONFIG.AUTH.REGISTER, datos);
        console.log('📥 Respuesta del servidor:', response);
        
        if (response.success) {
            // Guardar token automáticamente
            if (response.token) {
                localStorage.setItem('fiberfast_token', response.token);
                localStorage.setItem('fiberfast_user', JSON.stringify(response.user));
                console.log('✅ Token guardado correctamente');
            }
            
            mostrarMensajeRegistro('✅ ¡Registro exitoso! Serás redirigido al dashboard.', 'success');
            
            setTimeout(() => {
                window.location.href = '/page/dashboard.html';
            }, 2000);
        } else {
            mostrarMensajeRegistro(`❌ ${response.message || 'Error al registrar usuario.'}`, 'error');
            
            if (btnRegister) {
                btnRegister.disabled = false;
                btnRegister.innerHTML = originalText;
            }
        }
    } catch (error) {
        console.error('❌ Error en registro:', error);
        
        let errorMessage = 'Error al registrar. Por favor, intenta nuevamente.';
        if (error.message) {
            errorMessage = `❌ ${error.message}`;
        }
        
        mostrarMensajeRegistro(errorMessage, 'error');
        
        if (btnRegister) {
            btnRegister.disabled = false;
            btnRegister.innerHTML = originalText;
        }
    }
}

/**
 * Valida los datos del registro
 */
function validarRegistro(datos) {
    let isValid = true;
    
    // Validar NIC
    if (!datos.nic || datos.nic.length < 5) {
        mostrarErrorCampo('nic', 'El NIC debe tener al menos 5 dígitos.');
        isValid = false;
    }
    
    // Validar nombre
    if (!datos.nombre || datos.nombre.length < 2) {
        mostrarErrorCampo('nombre', 'El nombre debe tener al menos 2 caracteres.');
        isValid = false;
    }
    
    // Validar apellido
    if (!datos.apellido || datos.apellido.length < 2) {
        mostrarErrorCampo('apellido', 'El apellido debe tener al menos 2 caracteres.');
        isValid = false;
    }
    
    // Validar email
    if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        mostrarErrorCampo('correo', 'Ingresa un correo electrónico válido.');
        isValid = false;
    }
    
    // Validar contraseña
    if (!datos.password || datos.password.length < 8) {
        mostrarErrorCampo('password', 'La contraseña debe tener al menos 8 caracteres.');
        isValid = false;
    }
    
    // Validar complejidad de contraseña
    if (datos.password && datos.password.length >= 8) {
        const hasUpper = /[A-Z]/.test(datos.password);
        const hasLower = /[a-z]/.test(datos.password);
        const hasNumber = /[0-9]/.test(datos.password);
        
        if (!hasUpper || !hasLower || !hasNumber) {
            mostrarErrorCampo('password', 'La contraseña debe tener mayúscula, minúscula y número.');
            isValid = false;
        }
    }
    
    // Validar confirmación de contraseña
    const confirmPassword = document.getElementById('confirm-password')?.value || '';
    if (datos.password !== confirmPassword) {
        mostrarErrorCampo('confirm-password', 'Las contraseñas no coinciden.');
        isValid = false;
    }
    
    // Validar teléfono
    if (datos.telefono && !/^[0-9]{7,10}$/.test(datos.telefono)) {
        mostrarErrorCampo('telefono', 'Ingresa un número de teléfono válido (7-10 dígitos).');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Muestra error en un campo específico
 */
function mostrarErrorCampo(campoId, mensaje) {
    const errorSpan = document.getElementById(`error-${campoId}`);
    if (errorSpan) {
        errorSpan.textContent = mensaje;
        errorSpan.style.display = 'block';
        errorSpan.style.color = '#DC3545';
        errorSpan.style.fontSize = '13px';
        errorSpan.style.marginTop = '5px';
        
        // Limpiar después de 5 segundos
        setTimeout(() => {
            errorSpan.style.display = 'none';
        }, 5000);
    } else {
        console.warn(`⚠️ No se encontró el elemento de error para: ${campoId}`);
        // Fallback: mostrar alerta
        alert(mensaje);
    }
}

/**
 * Muestra mensaje global de registro
 */
function mostrarMensajeRegistro(mensaje, tipo) {
    console.log(`📝 Mensaje (${tipo}): ${mensaje}`);
    
    // Buscar o crear contenedor de mensajes
    let container = document.querySelector('.register-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'register-messages';
        const form = document.getElementById('registroForm');
        if (form) {
            // Insertar antes del botón de submit
            const submitBtn = form.querySelector('.btn-register');
            if (submitBtn) {
                form.insertBefore(container, submitBtn);
            } else {
                form.appendChild(container);
            }
        }
    }
    
    // Estilos según tipo
    const isSuccess = tipo === 'success';
    const bgColor = isSuccess ? '#d4edda' : '#f8d7da';
    const textColor = isSuccess ? '#155724' : '#721c24';
    const borderColor = isSuccess ? '#c3e6cb' : '#f5c6cb';
    
    container.innerHTML = `
        <div style="
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            background: ${bgColor};
            color: ${textColor};
            border: 1px solid ${borderColor};
            font-size: 14px;
            line-height: 1.5;
            animation: fadeIn 0.3s ease;
        ">
            ${mensaje}
        </div>
    `;
    
    // Si es éxito, no ocultar automáticamente (se redirigirá)
    if (!isSuccess) {
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

/**
 * Agregar estilos de animación dinámicamente
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

/**
 * Validación en tiempo real para el campo de teléfono
 */
document.addEventListener('DOMContentLoaded', function() {
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            // Solo permitir números
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Validar longitud
            if (this.value.length > 0 && this.value.length < 7) {
                const errorSpan = document.getElementById('error-telefono');
                if (errorSpan) {
                    errorSpan.textContent = '⚠️ El teléfono debe tener al menos 7 dígitos';
                    errorSpan.style.display = 'block';
                }
            } else if (this.value.length >= 7) {
                const errorSpan = document.getElementById('error-telefono');
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                }
            }
        });
    }
    
    // Validación en tiempo real para confirmar contraseña
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    
    if (passwordInput && confirmInput) {
        const validateMatch = function() {
            const errorSpan = document.getElementById('error-confirm-password');
            if (errorSpan) {
                if (confirmInput.value.length > 0 && passwordInput.value !== confirmInput.value) {
                    errorSpan.textContent = '⚠️ Las contraseñas no coinciden';
                    errorSpan.style.display = 'block';
                } else if (confirmInput.value.length > 0) {
                    errorSpan.style.display = 'none';
                }
            }
        };
        
        passwordInput.addEventListener('input', validateMatch);
        confirmInput.addEventListener('input', validateMatch);
    }
});

console.log('✅ register.js cargado correctamente');