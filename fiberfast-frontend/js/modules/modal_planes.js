/**
 * Modal de Solicitud de Planes
 * Conectado al backend de FiberFast
 */

// Funciones para el modal de solicitud
function abrirModalSolicitud(plan = '') {
    const modal = document.getElementById('solicitud-modal');
    if (!modal) return;
    
    // Si se especifica un plan, seleccionarlo en el dropdown
    if (plan) {
        const planSelect = document.getElementById('modal-plan');
        if (planSelect) {
            // Buscar por coincidencia parcial
            for (let i = 0; i < planSelect.options.length; i++) {
                if (planSelect.options[i].text.includes(plan.split(' - ')[0])) {
                    planSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModalSolicitud() {
    const modal = document.getElementById('solicitud-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.getElementById('solicitud-modal-form')?.reset();
    }
}

async function guardarSolicitud(datos) {
    try {
        const response = await apiPost(API_CONFIG.SOLICITUDES.CREATE, datos);
        return response;
    } catch (error) {
        console.error('Error guardando solicitud:', error);
        throw error;
    }
}

async function handleSolicitudSubmit(event) {
    event.preventDefault();
    
    const solicitud = {
        nombre: document.getElementById('modal-nombre').value.trim(),
        telefono: document.getElementById('modal-telefono').value.trim(),
        email: document.getElementById('modal-email').value.trim(),
        plan_interes: document.getElementById('modal-plan').value,
        direccion: document.getElementById('modal-direccion').value.trim(),
        mensaje: document.getElementById('modal-mensaje').value.trim(),
        origen: 'modal_landing'
    };
    
    // Validar campos obligatorios
    if (!solicitud.nombre || !solicitud.telefono || !solicitud.email || !solicitud.direccion) {
        mostrarMensajeModal('Por favor completa todos los campos obligatorios.', 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = document.querySelector('#solicitud-modal-form button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }
    
    try {
        const response = await guardarSolicitud(solicitud);
        
        if (response.success) {
            mostrarMensajeModal('✅ ¡Solicitud enviada con éxito! Un asesor te contactará pronto.', 'success');
            
            setTimeout(() => {
                cerrarModalSolicitud();
            }, 2000);
        } else {
            mostrarMensajeModal('❌ Error al enviar la solicitud: ' + (response.error || 'Intenta nuevamente'), 'error');
        }
    } catch (error) {
        console.error('Error enviando solicitud:', error);
        mostrarMensajeModal('❌ Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
    }
    
    // Restaurar botón
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function mostrarMensajeModal(mensaje, tipo) {
    const msgDiv = document.getElementById('modal-mensaje-resultado');
    if (msgDiv) {
        msgDiv.textContent = mensaje;
        msgDiv.className = `modal-mensaje ${tipo}`;
        msgDiv.style.display = 'block';
        msgDiv.style.backgroundColor = tipo === 'success' ? '#d4edda' : '#f8d7da';
        msgDiv.style.color = tipo === 'success' ? '#155724' : '#721c24';
        msgDiv.style.padding = '15px';
        msgDiv.style.borderRadius = '8px';
        msgDiv.style.marginBottom = '15px';
        
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 4000);
    }
}

// Cargar planes desde la API para el modal
async function cargarPlanesModal() {
    const planSelect = document.getElementById('modal-plan');
    if (!planSelect) return;
    
    try {
        const response = await apiGet(API_CONFIG.PLANES.LIST);
        
        if (response.success && response.planes) {
            // Limpiar select
            planSelect.innerHTML = '';
            
            // Agregar opciones
            response.planes.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.nombre;
                option.textContent = `${plan.nombre} - ${plan.velocidad} Mbps - $${plan.precio.toLocaleString()}/mes`;
                planSelect.appendChild(option);
            });
            
            console.log('✅ Planes cargados en el modal');
        }
    } catch (error) {
        console.error('❌ Error cargando planes en modal:', error);
        // Mantener opciones por defecto
    }
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modal con botón
    document.querySelectorAll('.modal-close-solicitud').forEach(btn => {
        btn.addEventListener('click', cerrarModalSolicitud);
    });
    
    // Enviar formulario
    document.getElementById('solicitud-modal-form')?.addEventListener('submit', handleSolicitudSubmit);
    
    // Cerrar al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) cerrarModalSolicitud();
    });
    
    // Cargar planes en el modal
    cargarPlanesModal();
});