// src/services/supabaseService.js
import { supabase } from './supabaseClient.js';

class SupabaseService {
    
    // ==================== USUARIOS ====================
    
    async findUserByEmail(email) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();
        
        if (error) {
            console.error('Error encontrando usuario:', error);
            return null;
        }
        return data;
    }

    async verificarEmailExistente(email) {
        const user = await this.findUserByEmail(email);
        return !!user;
    }

    async obtenerUsuarios() {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('nombre');
        
        if (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
        return data || [];
    }

    // ==================== VUELOS ====================
    
    async obtenerVuelos() {
        const { data, error } = await supabase
            .from('vuelos')
            .select('*')
            .order('fecha', { ascending: true });
        
        if (error) {
            console.error('Error obteniendo vuelos:', error);
            return [];
        }
        return data || [];
    }

    async findVueloById(id) {
        const { data, error } = await supabase
            .from('vuelos')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error encontrando vuelo:', error);
            return null;
        }
        return data;
    }

    async agregarVuelo(vuelo) {
        const nuevoVuelo = {
            numero: vuelo.numero || `F${Math.floor(Math.random() * 9000) + 1000}`,
            origen: vuelo.origen,
            destino: vuelo.destino,
            fecha: vuelo.fecha,
            hora_salida: vuelo.hora_salida || '08:00',
            precio: vuelo.precio || vuelo.tarifa || 0,
            estado: vuelo.estado || 'A tiempo'
        };

        const { data, error } = await supabase
            .from('vuelos')
            .insert([nuevoVuelo])
            .select();
        
        if (error) {
            console.error('Error agregando vuelo:', error);
            return null;
        }
        return data?.[0] || null;
    }

    async actualizarVuelo(id, nuevosDatos) {
        const { error } = await supabase
            .from('vuelos')
            .update(nuevosDatos)
            .eq('id', id);
        
        if (error) {
            console.error('Error actualizando vuelo:', error);
            return false;
        }
        return true;
    }

    async eliminarVuelo(id) {
        const { error } = await supabase
            .from('vuelos')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error eliminando vuelo:', error);
            return false;
        }
        return true;
    }

    // ==================== RESERVAS ====================
    
    async crearReserva(reserva) {
        // Verificar que el vuelo existe
        const vuelo = await this.findVueloById(reserva.vueloId);
        if (!vuelo) {
            throw new Error('Vuelo no encontrado');
        }

        const nuevaReserva = {
            usuario_id: reserva.clienteId,
            vuelo_id: reserva.vueloId,
            asientos: reserva.asientos || [],
            clase: reserva.clase || 'economica',
            total: reserva.total || 0,
            estado: reserva.estado || 'confirmada'
            //estado: reserva.estado || 'pendiente'

        };

        const { data, error } = await supabase
            .from('reservas')
            .insert([nuevaReserva])
            .select();
        
        if (error) {
            console.error('Error creando reserva:', error);
            throw error;
        }

        return data?.[0] || null;
    }

    async findReservaById(id) {
        const { data, error } = await supabase
            .from('reservas')
            .select(`
                *,
                vuelos:vuelo_id (*)
            `)
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error encontrando reserva:', error);
            return null;
        }
        return data;
    }

    async obtenerReservas() {
        const { data, error } = await supabase
            .from('reservas')
            .select(`
                *,
                usuarios:usuario_id (nombre, email),
                vuelos:vuelo_id (origen, destino, numero, precio)
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error obteniendo reservas:', error);
            return [];
        }
        return data || [];
    }

    async obtenerReservasByUser(userId) {
    try {
        console.log('🔍 Buscando reservas para usuario:', userId);
        
        const { data, error } = await supabase
            .from('reservas')
            .select(`
                *,
                vuelos:vuelo_id (origen, destino, numero, fecha, precio)
            `)
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error en consulta:', error);
            return [];
        }
        
        console.log('✅ Reservas encontradas:', data?.length || 0, data);
        
        // Transformar los datos para que tengan el formato esperado
        const reservasFormateadas = (data || []).map(r => ({
            id: r.id,
            codigo: r.id.substring(0, 8).toUpperCase(),
            clienteId: r.usuario_id,
            vueloId: r.vuelo_id,
            asientos: r.asientos || [],
            fecha: r.created_at,
            total: r.total || 0,
            estado: r.estado || 'confirmada',
            clase: r.clase || 'economica',
            vuelo: r.vuelos
        }));
        
        console.log('📦 Reservas formateadas:', reservasFormateadas);
        return reservasFormateadas;
        
    } catch (error) {
        console.error('Error en obtenerReservasByUser:', error);
        return [];
    }
}

    async cancelarReserva(id) {
        const { error } = await supabase
            .from('reservas')
            .update({ estado: 'cancelada' })
            .eq('id', id);
        
        if (error) {
            console.error('Error cancelando reserva:', error);
            return false;
        }
        return true;
    }

    async actualizarReserva(id, datos) {
        const { error } = await supabase
            .from('reservas')
            .update(datos)
            .eq('id', id);
        
        if (error) {
            console.error('Error actualizando reserva:', error);
            return false;
        }
        return true;
    }

    // ==================== PAGOS ====================
    
    // En src/services/supabaseService.js - Reemplazar la función registrarPago

async registrarPago(pago) {
    try {
        console.log('💳 Registrando pago en Supabase:', pago);
        
        // Verificar que la reserva existe
        const reserva = await this.findReservaById(pago.reservaId);
        if (!reserva) {
            console.error('❌ Reserva no encontrada:', pago.reservaId);
            throw new Error('Reserva no encontrada');
        }

        console.log('✅ Reserva encontrada:', reserva);

        const nuevoPago = {
            reserva_id: pago.reservaId,
            metodo: pago.metodo || 'tarjeta',
            monto: pago.monto || reserva.total || 0,
            estado: pago.estado || 'completado',
            created_at: new Date().toISOString()
        };

        console.log('📝 Insertando pago:', nuevoPago);

        const { data, error } = await supabase
            .from('pagos')
            .insert([nuevoPago])
            .select();
        
        if (error) {
            console.error('❌ Error registrando pago:', error);
            throw error;
        }

        console.log('✅ Pago registrado en BD:', data);

        // Actualizar estado de la reserva a 'pagada'
        const { error: updateError } = await supabase
            .from('reservas')
            .update({ estado: 'pagada' })
            .eq('id', pago.reservaId);

        if (updateError) {
            console.error('❌ Error actualizando reserva:', updateError);
        } else {
            console.log('✅ Reserva actualizada a pagada');
        }

        return data?.[0] || null;
        
    } catch (error) {
        console.error('❌ Error en registrarPago:', error);
        throw error;
    }
}

    async obtenerPagos() {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
                *,
                reservas:reserva_id (usuario_id, total)
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error obteniendo pagos:', error);
            return [];
        }
        return data || [];
    }

    async obtenerPagosByUser(userId) {
    try {
        console.log('🔍 Buscando pagos para usuario:', userId);
        
        // Primero obtener las reservas del usuario
        const { data: reservas, error: errorReservas } = await supabase
            .from('reservas')
            .select('id')
            .eq('usuario_id', userId);
        
        if (errorReservas) {
            console.error('Error obteniendo reservas:', errorReservas);
            return [];
        }
        
        if (!reservas || reservas.length === 0) {
            return [];
        }
        
        // Obtener los ids de las reservas
        const reservaIds = reservas.map(r => r.id);
        
        // Obtener los pagos de esas reservas
        const { data: pagos, error } = await supabase
            .from('pagos')
            .select(`
                *,
                reservas:reserva_id (*)
            `)
            .in('reserva_id', reservaIds)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error obteniendo pagos:', error);
            return [];
        }
        
        console.log('✅ Pagos encontrados:', pagos?.length || 0);
        
        // Transformar para compatibilidad
        return (pagos || []).map(p => ({
            id: p.id,
            codigo: p.id.substring(0, 8).toUpperCase(),
            reservaId: p.reserva_id,
            monto: p.monto,
            metodo: p.metodo,
            fecha: p.created_at,
            estado: p.estado
        }));
        
    } catch (error) {
        console.error('Error en obtenerPagosByUser:', error);
        return []; // Devolver array vacío en lugar de lanzar error
    }
  }

  // ==================== RESERVAS PENDIENTES ====================

async guardarReservaPendiente(reserva) {
    try {
        const data = {
            usuario_id: reserva.clienteId,
            vuelo_id: reserva.vueloId,
            asientos: reserva.asientos,
            total: reserva.total,
            clase: reserva.clase,
            timestamp: new Date().toISOString(),
            expira: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            estado: 'pendiente'
        };
        
        const { data: resultado, error } = await supabase
            .from('reservas_pendientes')
            .insert([data])
            .select();
        
        if (error) throw error;
        
        console.log('✅ Reserva pendiente guardada en Supabase:', resultado);
        return resultado?.[0] || null;
        
    } catch (error) {
        console.error('❌ Error guardando reserva pendiente:', error);
        return null;
    }
}

async obtenerReservasPendientesByUser(usuarioId) {
    try {
        const { data, error } = await supabase
            .from('reservas_pendientes')
            .select(`
                *,
                vuelos:vuelo_id (origen, destino, fecha, precio, numero)
            `)
            .eq('usuario_id', usuarioId)
            .eq('estado', 'pendiente')
            .gt('expira', new Date().toISOString())
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        // Transformar datos
        const reservasFormateadas = (data || []).map(r => ({
            id: r.id,
            codigo: r.id.substring(0, 8).toUpperCase(),
            clienteId: r.usuario_id,
            vueloId: r.vuelo_id,
            asientos: r.asientos,
            total: r.total,
            clase: r.clase,
            timestamp: r.timestamp,
            expira: r.expira,
            estado: r.estado,
            vuelo: r.vuelos
        }));
        
        return reservasFormateadas;
        
    } catch (error) {
        console.error('Error obteniendo reservas pendientes:', error);
        return [];
    }
}

async eliminarReservaPendiente(reservaId) {
    try {
        const { error } = await supabase
            .from('reservas_pendientes')
            .delete()
            .eq('id', reservaId);
        
        if (error) throw error;
        
        console.log('✅ Reserva pendiente eliminada:', reservaId);
        return true;
        
    } catch (error) {
        console.error('❌ Error eliminando reserva pendiente:', error);
        return false;
    }
}

async actualizarEstadoReservaPendiente(reservaId, estado) {
    try {
        const { error } = await supabase
            .from('reservas_pendientes')
            .update({ estado: estado })
            .eq('id', reservaId);
        
        if (error) throw error;
        
        console.log(`✅ Reserva pendiente actualizada a: ${estado}`);
        return true;
        
    } catch (error) {
        console.error('Error actualizando reserva pendiente:', error);
        return false;
    }
}
}



// Exportar una instancia única
export const supabaseService = new SupabaseService();