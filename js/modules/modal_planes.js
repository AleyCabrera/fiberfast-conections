// Funciones para el modal de solicitud
function abrirModalSolicitud(plan = '') {
    const modal = document.getElementById('solicitud-modal');
    const planSelect = document.getElementById('modal-plan');
    if (plan && planSelect) {
        for (let i = 0; i < planSelect.options.length; i++) {
            if (planSelect.options[i].value.includes(plan.split(' - ')[0])) {
                planSelect.selectedIndex = i;
                break;
            }
        }
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModalSolicitud() {
    const modal = document.getElementById('solicitud-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('solicitud-modal-form')?.reset();
}

function guardarSolicitud(datos) {
    const solicitudes = JSON.parse(localStorage.getItem('fiberfast_solicitudes') || '[]');
    datos.id = Date.now();
    datos.fecha = new Date().toISOString();
    datos.estado = 'pendiente';
    solicitudes.push(datos);
    localStorage.setItem('fiberfast_solicitudes', JSON.stringify(solicitudes));
}

function handleSolicitudSubmit(event) {
    event.preventDefault();
    
    const solicitud = {
        nombre: document.getElementById('modal-nombre').value.trim(),
        telefono: document.getElementById('modal-telefono').value.trim(),
        email: document.getElementById('modal-email').value.trim(),
        plan: document.getElementById('modal-plan').value,
        direccion: document.getElementById('modal-direccion').value.trim(),
        mensaje: document.getElementById('modal-mensaje').value.trim(),
        origen: 'modal_landing'
    };
    
    if (!solicitud.nombre || !solicitud.telefono || !solicitud.email || !solicitud.direccion) {
        mostrarMensajeModal('Por favor completa todos los campos obligatorios.', 'error');
        return;
    }
    
    guardarSolicitud(solicitud);
    mostrarMensajeModal('✅ ¡Solicitud enviada con éxito! Un asesor te contactará pronto.', 'success');
    
    setTimeout(() => {
        cerrarModalSolicitud();
    }, 2000);
}

function mostrarMensajeModal(mensaje, tipo) {
    const msgDiv = document.getElementById('modal-mensaje-resultado');
    msgDiv.textContent = mensaje;
    msgDiv.style.backgroundColor = tipo === 'success' ? '#d4edda' : '#f8d7da';
    msgDiv.style.color = tipo === 'success' ? '#155724' : '#721c24';
    msgDiv.style.display = 'block';
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 4000);
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-close-solicitud').forEach(btn => {
        btn.addEventListener('click', cerrarModalSolicitud);
    });
    
    document.getElementById('solicitud-modal-form')?.addEventListener('submit', handleSolicitudSubmit);
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) cerrarModalSolicitud();
    });
});