// main.js - VERSIÓN LIMPIA Y CORREGIDA
import { renderPagos } from './interfaz.js';
import Interfaz from './interfaz.js';
import { AuthService } from './services/authService.js';
import { EmailService } from './services/emailService.js';
import { procesarPago } from './controladores.js';

// ========== DEPURACIÓN ==========
console.log('🚀 MAIN.JS CARGADO');
console.log('📋 sessionStorage actual:', sessionStorage.getItem('reservaPendiente'));

// Agrega esto al inicio de main.js para verificar


const container = document.getElementById('app');

// ========== FUNCIONES AUXILIARES ==========
function showToast(msg, type = 'primary') {
    const containerToast = document.getElementById('toast-container');
    if (!containerToast) return;
    
    const id = 't' + Math.random().toString(36).slice(2);
    containerToast.insertAdjacentHTML(
        'beforeend',
        `
        <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2 show" role="alert">
            <div class="d-flex">
                <div class="toast-body">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
        `
    );
    setTimeout(() => document.getElementById(id)?.remove(), 4000);
}

// Hacer showToast global para que otras funciones puedan usarlo
window.showToast = showToast;

// ========== PANEL DE NOTIFICACIONES ==========
function renderNotificaciones() {
    const lista = document.getElementById('listaNotificaciones');
    if (!lista) return;

    const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    lista.innerHTML = notificaciones.length
        ? notificaciones.map(n => `
            <div class="alert alert-${n.type} py-1 mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <small class="text-muted">${new Date(n.fecha).toLocaleString()}</small><br>
                    ${n.msg}
                </div>
                <button type="button" class="btn-close btn-close-white btn-sm" onclick="removeNotificacion(${n.id})"></button>
            </div>
        `).join('')
        : '<div class="text-muted"></div>';
}

window.removeNotificacion = function(id) {
    let notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    notificaciones = notificaciones.filter(n => n.id !== id);
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    renderNotificaciones();
};

// ========== ACTUALIZAR BARRA DE USUARIO ==========
function updateUserArea() {
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    const userArea = document.getElementById('nav-user-area');
    if (!userArea) return;

    if (!user) {
        userArea.innerHTML = '';
        return;
    }

    userArea.innerHTML = `
        <span class="fw-bold me-2">${user.rol === 'admin' ? 'Admin: ' : ''}${user.nombre}</span>
        ${user.rol === 'admin' ? '<a href="admin.html" class="btn btn-sm btn-warning">Administrar</a>' : ''}
        <a href="#" class="btn btn-sm btn-danger" id="btnCerrarSesion">Cerrar sesión</a>
    `;

    document.getElementById('btnCerrarSesion')?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('aero_user');
        location.reload();
    });
}



// ========== EVENT LISTENER DEL FORMULARIO DE PAGO - VERSIÓN CORREGIDA ==========
// SOLO guarda en sessionStorage, NO crea reserva en BD
document.getElementById('formPago')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔴 FORMULARIO DE PAGO ENVIADO - Modo sessionStorage');

    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        return;
    }

    const montoInput = this.querySelector('input[name="monto"]');
    const nombreInput = this.querySelector('input[name="nombre"]');
    const numeroInput = this.querySelector('input[name="numero"]');
    const expInput = this.querySelector('input[name="exp"]');
    const cvvInput = this.querySelector('input[name="cvv"]');
    
    const monto = montoInput ? parseFloat(montoInput.value) : NaN;
    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const numero = numeroInput ? numeroInput.value.trim() : '';
    const exp = expInput ? expInput.value.trim() : '';
    const cvv = cvvInput ? cvvInput.value.trim() : '';

    console.log('💳 DATOS DEL PAGO:', { monto, nombre });

    // Validaciones
    if (isNaN(monto) || monto <= 0) {
        showToast('El monto debe ser un número válido', 'warning');
        return;
    }
    if (numero.length < 15 || numero.length > 16) {
        showToast('Número de tarjeta inválido', 'warning');
        return;
    }
    if (!exp.match(/^\d{2}\/\d{2}$/)) {
        showToast('Formato de fecha inválido (MM/AA)', 'warning');
        return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
        showToast('CVV inválido', 'warning');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
    submitBtn.disabled = true;

    try {
        // Obtener reserva pendiente de sessionStorage
        const reservaPendienteStr = sessionStorage.getItem('reservaPendiente');
        console.log('📦 reservaPendienteStr:', reservaPendienteStr);
        
        if (!reservaPendienteStr) {
            showToast('Error: No hay reserva pendiente', 'danger');
            return;
        }
        
        const reservaPendiente = JSON.parse(reservaPendienteStr);
        console.log('📦 Datos pendientes:', reservaPendiente);
        
        // Verificar expiración (30 minutos)
        if (Date.now() - reservaPendiente.timestamp > 30 * 60 * 1000) {
            showToast('La sesión ha expirado. Inicia una nueva reserva.', 'danger');
            sessionStorage.removeItem('reservaPendiente');
            return;
        }
        
        // Crear ID temporal para mostrar en Mis Reservas
        const tempId = 'temp_' + Date.now();
        const reservaConId = {
            ...reservaPendiente,
            id: tempId,
            codigo: tempId.substring(0, 8).toUpperCase(),
            estado: 'pendiente'
        };
        
        // Actualizar sessionStorage con el ID temporal
        sessionStorage.setItem('reservaPendiente', JSON.stringify(reservaConId));
        
        console.log('✅ Reserva guardada en sessionStorage (NO en BD):', reservaConId);
        
        // ==== CERRAR MODAL CORRECTAMENTE ====
        const modalElement = document.getElementById('modalPago');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        } else {
            // Si no hay instancia, crear una y cerrar
            const newModal = new bootstrap.Modal(modalElement);
            newModal.hide();
        }
        
        // Limpiar el formulario
        this.reset();
        
        showToast('✅ Reserva guardada. Ve a "Mis Reservas" para pagar.', 'success');
        
        // Redirigir a Mis Reservas
        setTimeout(() => {
            window.location.href = 'reservas.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error en proceso:', error);
        showToast('Error al procesar: ' + error.message, 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ========== FORMULARIO DE REGISTRO ==========
document.getElementById('formRegister')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPass')?.value;

    if (!nombre || !email || !password) {
        showToast('Todos los campos son obligatorios', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando...';
    submitBtn.disabled = true;

    try {
        const resultado = await AuthService.registrarUsuario({ nombre, email, password });

        if (resultado.success) {
            showToast('✅ Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalRegister'))?.hide();
            this.reset();
            setTimeout(() => new bootstrap.Modal(document.getElementById('modalLogin')).show(), 500);
        } else {
            showToast(resultado.message, 'danger');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showToast('Error al registrar usuario', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ========== FORMULARIO DE LOGIN ==========
document.getElementById('formLogin')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPass')?.value.trim();

    if (!email || !password) {
        showToast('Email y contraseña son obligatorios', 'warning');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Iniciando...';
    submitBtn.disabled = true;

    try {
        const resultado = await AuthService.loginUsuario(email, password);

        if (resultado.success) {
            sessionStorage.setItem('aero_user', JSON.stringify(resultado.user));
            showToast(`✅ Bienvenido, ${resultado.user.nombre}`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalLogin'))?.hide();
            this.reset();
            updateUserArea();
            Interfaz.renderInicio(container);
        } else {
            showToast(resultado.message, 'danger');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showToast('Error al iniciar sesión', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ========== RECUPERAR CONTRASEÑA ==========
document.getElementById('linkForgotPassword')?.addEventListener('click', e => {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalLogin'))?.hide();
    new bootstrap.Modal(document.getElementById('modalForgotPassword')).show();
});

document.getElementById('btnSendToken1')?.addEventListener('click', () => {
    const email = document.getElementById('fpEmail1')?.value.trim();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find(u => u.email === email);

    if (!user) return showToast('Correo no encontrado', 'danger');

    const token = Math.floor(100000 + Math.random() * 900000);
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    tokens[email] = token;
    localStorage.setItem('tokens', JSON.stringify(tokens));

    showToast(`Token enviado (simulado): ${token}`, 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalForgotPassword'))?.hide();
    new bootstrap.Modal(document.getElementById('modalResetPassword')).show();
    document.getElementById('rpEmail1').value = email;
});

document.getElementById('btnResetPassword1')?.addEventListener('click', () => {
    const email = document.getElementById('rpEmail1')?.value.trim();
    const tokenInput = document.getElementById('rpToken1')?.value.trim();
    const newPass = document.getElementById('rpPass1')?.value.trim();

    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (tokens[email] != tokenInput) return showToast('Token inválido', 'danger');

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const index = usuarios.findIndex(u => u.email === email);
    if (index === -1) return showToast('Usuario no encontrado', 'danger');

    usuarios[index].password = newPass;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    delete tokens[email];
    localStorage.setItem('tokens', JSON.stringify(tokens));

    showToast('Contraseña actualizada', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalResetPassword'))?.hide();
});

// ========== ENLACES DE NAVEGACIÓN ==========
document.getElementById('linkRegisterFromLogin')?.addEventListener('click', e => {
    e.preventDefault();
    const modalLogin = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
    const modalRegisterEl = document.getElementById('modalRegister');

    if (modalLogin) {
        modalLogin.hide();
        document.getElementById('modalLogin').addEventListener('hidden.bs.modal', () => {
            new bootstrap.Modal(modalRegisterEl).show();
        }, { once: true });
    } else {
        new bootstrap.Modal(modalRegisterEl).show();
    }
});

document.getElementById('nav-inicio')?.addEventListener('click', e => {
    e.preventDefault();
    location.reload();
});

document.getElementById('nav-misreservas')?.addEventListener('click', e => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        new bootstrap.Modal(document.getElementById('modalLogin')).show();
        return;
    }
    //window.open('reservas.html', '_blank');
    window.location.href = 'reservas.html';
    
});

document.getElementById('nav-pagos')?.addEventListener('click', e => {
    e.preventDefault();
    renderPagos(container);
});

// ========== VERIFICACIÓN DE EMAIL EN TIEMPO REAL ==========
function initializeEmailVerification() {
    const emailInput = document.getElementById('regEmail');
    if (!emailInput) return;

    let verificationTimer;
    emailInput.addEventListener('input', function(e) {
        const email = e.target.value.trim();
        clearTimeout(verificationTimer);

        let statusElement = document.getElementById('email-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'email-status';
            statusElement.className = 'mt-1 small';
            emailInput.parentNode.appendChild(statusElement);
        }

        if (!email) {
            statusElement.innerHTML = '';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            statusElement.innerHTML = '<span class="text-warning">⏳ Formato de email inválido</span>';
            return;
        }

        statusElement.innerHTML = '<span class="text-info">⏳ Verificando...</span>';

        verificationTimer = setTimeout(() => {
            try {
                const resultado = EmailService.verificarEmail(email);
                if (resultado.exists) {
                    statusElement.innerHTML = '<span class="text-danger">❌ Email ya registrado</span>';
                } else if (resultado.valid) {
                    statusElement.innerHTML = '<span class="text-success">✅ Email disponible</span>';
                } else {
                    statusElement.innerHTML = `<span class="text-warning">⚠️ ${resultado.message}</span>`;
                }
            } catch (error) {
                console.error('Error en verificación:', error);
                statusElement.innerHTML = '<span class="text-danger">❌ Error verificando email</span>';
            }
        }, 500);
    });
}

// ========== FUNCIÓN GLOBAL PARA ABRIR PAGO ==========
window.abrirPago = function(reservaId) {
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) { 
        showToast('Inicia sesión para pagar', 'warning'); 
        new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
        return; 
    }

    const formPago = document.getElementById('formPago');
    if (!formPago) return;

    formPago.dataset.reservaId = reservaId;
    formPago.reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago')).show();
};

document.addEventListener('hidden.bs.modal', function () {
    // 🔥 limpiar SIEMPRE cualquier residuo de Bootstrap
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';

    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
});

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar localStorage problemático
    // localStorage.clear(); // Opcional - descomentar si hay problemas
    
    initializeEmailVerification();
    Interfaz.renderInicio(container);
    updateUserArea();
    renderNotificaciones();
});


// ========== EVENT LISTENER DEL FORMULARIO DE PAGO - VERSIÓN CON SUPABASE ==========
// Eliminar cualquier listener anterior
const oldForm = document.getElementById('formPago');
if (oldForm) {
    const newForm = oldForm.cloneNode(true);
    oldForm.parentNode.replaceChild(newForm, oldForm);
}

// Agregar el nuevo listener con Supabase
document.getElementById('formPago')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔴 FORMULARIO DE PAGO ENVIADO - Usando Supabase');

    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        return;
    }

    const montoInput = this.querySelector('input[name="monto"]');
    const nombreInput = this.querySelector('input[name="nombre"]');
    const numeroInput = this.querySelector('input[name="numero"]');
    const expInput = this.querySelector('input[name="exp"]');
    const cvvInput = this.querySelector('input[name="cvv"]');
    
    const monto = montoInput ? parseFloat(montoInput.value) : NaN;
    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const numero = numeroInput ? numeroInput.value.trim() : '';
    const exp = expInput ? expInput.value.trim() : '';
    const cvv = cvvInput ? cvvInput.value.trim() : '';

    console.log('💳 DATOS:', { monto, nombre, numero: numero.substring(0, 4) + '****' });

    // Validaciones
    if (isNaN(monto) || monto <= 0) {
        showToast('Monto inválido', 'warning');
        return;
    }
    if (numero.length < 15) {
        showToast('Número de tarjeta inválido', 'warning');
        return;
    }
    if (!exp.match(/^\d{2}\/\d{2}$/)) {
        showToast('Fecha inválida (MM/AA)', 'warning');
        return;
    }
    if (cvv.length < 3) {
        showToast('CVV inválido', 'warning');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
    submitBtn.disabled = true;

    try {
        // Obtener reserva pendiente del dataset (ID de Supabase)
        const reservaPendienteId = this.dataset.reservaPendienteId;
        console.log('📦 reservaPendienteId:', reservaPendienteId);
        
        if (!reservaPendienteId) {
            showToast('Error: No hay reserva pendiente', 'danger');
            return;
        }
        
        // Importar supabase
        const { supabase } = await import('./services/supabaseClient.js');
        
        // Obtener la reserva pendiente de Supabase
        const { data: pendienteData, error: pendienteError } = await supabase
            .from('reservas_pendientes')
            .select('*')
            .eq('id', reservaPendienteId)
            .single();
        
        if (pendienteError || !pendienteData) {
            showToast('Error: Reserva pendiente no encontrada', 'danger');
            return;
        }
        
        const pendiente = pendienteData;
        
        // Verificar expiración
        if (new Date(pendiente.expira) < new Date()) {
            showToast('La reserva ha expirado. Inicia una nueva reserva.', 'danger');
            await supabase.from('reservas_pendientes').delete().eq('id', reservaPendienteId);
            return;
        }
        
        // Crear reserva real en BD
        const { crearReserva } = await import('./controladores.js');
        const resultadoReserva = await crearReserva({ 
            clienteId: pendiente.usuario_id, 
            vueloId: pendiente.vuelo_id, 
            asientos: pendiente.asientos,
            total: pendiente.total,
            clase: pendiente.clase
        });
        
        if (!resultadoReserva || !resultadoReserva.ok) {
            showToast('Error al crear la reserva', 'danger');
            return;
        }
        
        // Procesar pago
        const resultadoPago = await procesarPago({ 
            reservaId: resultadoReserva.reserva.id, 
            monto: monto, 
            nombre: nombre,
            metodo: 'tarjeta'
        });
        
        if (resultadoPago && resultadoPago.ok) {
            // Eliminar reserva pendiente de Supabase
            await supabase.from('reservas_pendientes').delete().eq('id', reservaPendienteId);
            
            showToast('✅ Reserva y pago completados', 'success');
            delete this.dataset.reservaPendienteId;
            
            // Cerrar modal
            const modalElement = document.getElementById('modalPago');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
            this.reset();
            
            setTimeout(() => {
                if (confirm('¿Ver tus reservas?')) {
                    window.location.href = 'reservas.html';
                } else {
                    location.reload();
                }
            }, 1500);
        } else {
            // Si el pago falla, cancelar la reserva creada
            const { cancelarReserva } = await import('./controladores.js');
            await cancelarReserva(resultadoReserva.reserva.id);
            showToast('Error en el pago. Reserva cancelada.', 'danger');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        showToast('Error al procesar: ' + error.message, 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});