// src/controladores.js
import { supabaseService } from './services/supabaseService.js';
import { EmailNotificationService } from './services/emailNotificationService.js';
import { AuthService } from './services/authService.js';
import { LoyaltyService } from './services/loyaltyService.js'; 

// ===== FUNCIONES AUXILIARES =====
function toast(msg, type = 'primary') {
    if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(msg, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${msg}`);
    }
}

// ===== USUARIOS (usando authService) =====
export const loginUsuario = AuthService.loginUsuario.bind(AuthService);
export const registrarUsuario = AuthService.registrarUsuario.bind(AuthService);

// ===== VUELOS =====
export async function listarVuelos() { 
    return await supabaseService.obtenerVuelos(); 
}

// ===== RESERVAS =====
export async function crearReserva({ clienteId, vueloId, asientos, total, clase = 'economica' }) {
    console.log('🎫 CREANDO RESERVA EN SUPABASE:', { clienteId, vueloId, asientos, total, clase });
    
    try {
        // Obtener el vuelo para calcular el total si no viene
        let totalFinal = total;
        if (!totalFinal) {
            const vuelo = await supabaseService.findVueloById(vueloId);
            if (vuelo) {
                totalFinal = vuelo.precio * asientos.length;
            }
        }

        const reserva = {
            clienteId,
            vueloId,
            asientos,
            total: totalFinal,
            clase,
            estado: 'confirmada'
        };

        const reservaCreada = await supabaseService.crearReserva(reserva);
        
        if (!reservaCreada) {
            console.error('❌ ERROR AL GUARDAR RESERVA');
            return { ok: false, msg: 'Error al crear la reserva' };
        }

        // Formatear para devolver con el mismo formato que antes
        const reservaFormateada = {
            id: reservaCreada.id,
            codigo: reservaCreada.id.substring(0, 8).toUpperCase(),
            clienteId: reservaCreada.usuario_id,
            vueloId: reservaCreada.vuelo_id,
            asientos: reservaCreada.asientos,
            fecha: reservaCreada.created_at,
            total: reservaCreada.total,
            estado: reservaCreada.estado,
            pagoEstado: 'pendiente',
            clase: reservaCreada.clase
        };

        console.log('✅ RESERVA GUARDADA EN SUPABASE:', reservaFormateada);
        
        return { ok: true, reserva: reservaFormateada };
        
    } catch (error) {
        console.error('❌ Error en crearReserva:', error);
        return { ok: false, msg: error.message || 'Error al crear la reserva' };
    }
}

export async function cancelarReserva(id) {
    console.log('🗑️ CANCELANDO RESERVA:', id);
    try {
        const ok = await supabaseService.cancelarReserva(id);
        return { ok };
    } catch (error) {
        console.error('Error cancelando reserva:', error);
        return { ok: false, msg: error.message };
    }
}

export async function obtenerReservasActivas(userId) {
    console.log('🔍 OBTENIENDO RESERVAS PARA USUARIO:', userId);
    
    try {
        const reservas = await supabaseService.obtenerReservasByUser(userId);
        console.log('🔍 Reservas obtenidas:', reservas);
        
        // Filtrar SOLO reservas activas (no canceladas)
        const reservasActivas = reservas.filter(r => r.estado !== 'cancelada');
        
        return {
            ok: true,
            reservas: reservasActivas,
            total: reservasActivas.length,
            mensaje: `Se encontraron ${reservasActivas.length} reservas activas`
        };
        
    } catch (error) {
        console.error('Error obteniendo reservas activas:', error);
        return {
            ok: false,
            reservas: [],
            total: 0,
            mensaje: error.message
        };
    }
}

// ===== PAGOS =====
// En src/controladores.js - Reemplazar la función procesarPago

export async function procesarPago(datosPago) {
    const { reservaId, monto, nombre, metodo = 'tarjeta' } = datosPago;
    
    console.log('💳 PROCESANDO PAGO EN SUPABASE:', { reservaId, monto, nombre, metodo });
    
    try {
        // Validar que tenemos todos los datos necesarios
        if (!reservaId) {
            return { ok: false, msg: 'ID de reserva no proporcionado' };
        }

        // Verificar que la reserva existe
        const reserva = await supabaseService.findReservaById(reservaId);
        if (!reserva) {
            console.error('❌ Reserva no encontrada:', reservaId);
            return { ok: false, msg: 'Reserva no encontrada' };
        }

        console.log('✅ Reserva encontrada:', reserva);

        // Calcular monto si no se proporcionó
        let montoFinal = monto;
        if (!montoFinal) {
            montoFinal = reserva.total || 0;
        }

        const pago = {
            reservaId,
            metodo,
            monto: montoFinal,
            estado: 'completado'
        };
        
        console.log('📝 Enviando pago a registrar:', pago);
        
        const pagoRegistrado = await supabaseService.registrarPago(pago);
        
        if (!pagoRegistrado) {
            console.error('❌ Error al registrar el pago - no se recibió datos');
            return { ok: false, msg: 'Error al registrar el pago' };
        }
        
        console.log('✅ PAGO REGISTRADO EN SUPABASE:', pagoRegistrado);
        
        // ========== REGISTRAR PUNTOS DE LEALTAD ==========
        // Esto se ejecuta SOLO si el pago fue exitoso
        if (reserva && reserva.usuario_id) {
            try {
                const puntosResultado = await LoyaltyService.registrarPuntosPorReserva(
                    reserva.usuario_id,
                    reserva.total || montoFinal,
                    reserva.clase || 'economica',
                    reservaId
                );
                
                if (puntosResultado.success) {
                    console.log(`✅ ${puntosResultado.puntosGanados} puntos registrados para el usuario ${reserva.usuario_id}`);
                    console.log(`🎯 Total de puntos: ${puntosResultado.totalPuntos} - Nivel: ${puntosResultado.nivel}`);
                } else {
                    console.warn('⚠️ Error registrando puntos:', puntosResultado.error);
                }
            } catch (error) {
                console.error('❌ Error en registro de puntos:', error);
                // No fallamos el pago si fallan los puntos
            }
        }
        // ========== FIN PUNTOS DE LEALTAD ==========
        
        return { 
            ok: true, 
            msg: 'Pago procesado correctamente',
            pago: {
                id: pagoRegistrado.id,
                codigo: pagoRegistrado.id ? pagoRegistrado.id.substring(0, 8).toUpperCase() : 'PAG' + Date.now(),
                reservaId: pagoRegistrado.reserva_id,
                monto: pagoRegistrado.monto,
                fecha: pagoRegistrado.created_at || new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('❌ Error procesando pago:', error);
        return { ok: false, msg: error.message || 'Error al procesar el pago' };
    }
}




export async function obtenerPagos() { 
    return await supabaseService.obtenerPagos(); 
}

export async function obtenerPagosByUser(userId) {
    return await supabaseService.obtenerPagosByUser(userId);
}