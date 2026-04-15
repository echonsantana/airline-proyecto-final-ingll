// src/services/loyaltyService.js
import { supabase } from './supabaseClient.js';

export class LoyaltyService {
  
  // Calcular puntos basado en monto y clase
  static calcularPuntos(monto, clase) {
    const multiplicadores = {
      economica: 1,
      economicaPlus: 1.5,
      business: 2,
      primera: 3
    };
    
    const puntosBase = Math.floor(monto / 10); // 1 punto por cada $10
    return Math.floor(puntosBase * (multiplicadores[clase] || 1));
  }

  // Obtener nivel basado en puntos totales
  static obtenerNivel(puntosTotales) {
    if (puntosTotales >= 10000) return { 
      nivel: 'Élite', 
      beneficio: '50% bonus en puntos', 
      color: '#dc3545',
      multiplicador: 1.5
    };
    if (puntosTotales >= 5000) return { 
      nivel: 'Oro', 
      beneficio: '25% bonus en puntos', 
      color: '#ffc107',
      multiplicador: 1.25
    };
    if (puntosTotales >= 1000) return { 
      nivel: 'Plata', 
      beneficio: '10% bonus en puntos', 
      color: '#6c757d',
      multiplicador: 1.1
    };
    return { 
      nivel: 'Miembro', 
      beneficio: 'Acumulación de puntos', 
      color: '#28a745',
      multiplicador: 1
    };
  }

  // Obtener beneficios por nivel
  static obtenerBeneficios(nivel) {
    const beneficios = {
      'Miembro': ['Acumulación de puntos', 'Ofertas exclusivas'],
      'Plata': ['Embarque prioritario', 'Asientos con más espacio', 'Check-in express'],
      'Oro': ['Acceso a salas VIP', 'Upgrade gratuito', 'Equipaje adicional'],
      'Élite': ['Servicio de chauffeur', 'Suite en vuelo', 'Asistente personal']
    };
    return beneficios[nivel] || beneficios['Miembro'];
  }

  // ========== FUNCIONES CON SUPABASE ==========

  // Obtener puntos de un usuario
  static async obtenerPuntosUsuario(userId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('puntos')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.puntos || 0;
    } catch (error) {
      console.error('Error obteniendo puntos:', error);
      return 0;
    }
  }

  // Agregar puntos a un usuario
  static async agregarPuntos(userId, puntos) {
    try {
      // Obtener puntos actuales
      const puntosActuales = await this.obtenerPuntosUsuario(userId);
      const nuevosPuntos = puntosActuales + puntos;
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('usuarios')
        .update({ puntos: nuevosPuntos })
        .eq('id', userId);
      
      if (error) throw error;
      
      console.log(`✅ +${puntos} puntos para usuario ${userId}. Total: ${nuevosPuntos}`);
      
      // Verificar si cambió de nivel
      const nivelActual = this.obtenerNivel(puntosActuales);
      const nivelNuevo = this.obtenerNivel(nuevosPuntos);
      
      if (nivelActual.nivel !== nivelNuevo.nivel) {
        console.log(`🎉 ¡Felicidades! Has alcanzado el nivel ${nivelNuevo.nivel}`);
      }
      
      return {
        success: true,
        puntos: nuevosPuntos,
        nivel: nivelNuevo.nivel
      };
    } catch (error) {
      console.error('Error agregando puntos:', error);
      return { success: false, error: error.message };
    }
  }

  // Registrar puntos por reserva (llamar después de pago exitoso)
  static async registrarPuntosPorReserva(userId, monto, clase, reservaId) {
    try {
      // Calcular puntos
      const puntosGanados = this.calcularPuntos(monto, clase);
      
      // Agregar puntos al usuario
      const resultado = await this.agregarPuntos(userId, puntosGanados);
      
      if (resultado.success) {
        // Guardar historial de puntos (opcional - crear tabla)
        await this.guardarHistorialPuntos(userId, puntosGanados, reservaId, monto, clase);
      }
      
      return {
        success: true,
        puntosGanados: puntosGanados,
        totalPuntos: resultado.puntos,
        nivel: resultado.nivel
      };
    } catch (error) {
      console.error('Error registrando puntos:', error);
      return { success: false, error: error.message };
    }
  }

  // Guardar historial de puntos (crear tabla primero)
  static async guardarHistorialPuntos(userId, puntos, reservaId, monto, clase) {
    try {
      // Opcional: Crear tabla 'puntos_historial' en Supabase
      const { error } = await supabase
        .from('puntos_historial')
        .insert([{
          usuario_id: userId,
          puntos: puntos,
          reserva_id: reservaId,
          monto: monto,
          clase: clase,
          created_at: new Date().toISOString()
        }]);
      
      if (error) console.error('Error guardando historial:', error);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Obtener historial de puntos de un usuario
  static async obtenerHistorialPuntos(userId) {
    try {
      const { data, error } = await supabase
        .from('puntos_historial')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  // Obtener información completa del usuario (puntos + nivel)
  static async getPerfilUsuario(userId) {
    try {
      const puntos = await this.obtenerPuntosUsuario(userId);
      const nivelInfo = this.obtenerNivel(puntos);
      const beneficios = this.obtenerBeneficios(nivelInfo.nivel);
      const historial = await this.obtenerHistorialPuntos(userId);
      
      return {
        puntos: puntos,
        nivel: nivelInfo.nivel,
        beneficio: nivelInfo.beneficio,
        color: nivelInfo.color,
        multiplicador: nivelInfo.multiplicador,
        beneficios: beneficios,
        historial: historial,
        proximoNivel: this.obtenerProximoNivel(puntos)
      };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  // Calcular puntos para próximo nivel
  static obtenerProximoNivel(puntosActuales) {
    if (puntosActuales < 1000) {
      return { nivel: 'Plata', puntosFaltantes: 1000 - puntosActuales };
    } else if (puntosActuales < 5000) {
      return { nivel: 'Oro', puntosFaltantes: 5000 - puntosActuales };
    } else if (puntosActuales < 10000) {
      return { nivel: 'Élite', puntosFaltantes: 10000 - puntosActuales };
    }
    return { nivel: 'Máximo', puntosFaltantes: 0 };
  }

  // Mostrar tarjeta de fidelidad en UI
  static renderTarjetaFidelidad(usuario) {
    return `
      <div class="card loyalty-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="mb-0">${usuario.nombre}</h5>
              <small>${usuario.email}</small>
            </div>
            <i class="bi bi-star-fill fs-1"></i>
          </div>
          
          <div class="text-center my-3">
            <h2 class="display-4">${usuario.puntos || 0}</h2>
            <p class="mb-0">PUNTOS ACUMULADOS</p>
          </div>
          
          <div class="text-center">
            <span class="badge bg-light text-dark px-3 py-2">
              Nivel: ${usuario.nivel || 'Miembro'}
            </span>
          </div>
          
          ${usuario.proximoNivel?.puntosFaltantes > 0 ? `
            <div class="mt-3">
              <small>Faltan ${usuario.proximoNivel.puntosFaltantes} puntos para ${usuario.proximoNivel.nivel}</small>
              <div class="progress mt-1" style="height: 5px;">
                <div class="progress-bar bg-warning" style="width: ${Math.min(100, (usuario.puntos / (usuario.puntos + usuario.proximoNivel.puntosFaltantes)) * 100)}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}