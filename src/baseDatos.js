// src/baseDatos.js
export class Vuelo {
  constructor(obj) {
    Object.assign(this, obj);
  }
}

// ✅ NUEVO: Sistema de Clases Premium
export class SistemaClases {
  static clases = {
    economica: {
      nombre: 'Económica',
      precioBase: 1.0,
      caracteristicas: ['Asiento estándar', 'Servicio básico'],
      filas: '15-30',
      color: '#28a745'
    },
    economicaPlus: {
      nombre: 'Económica Plus',
      precioBase: 1.3,
      caracteristicas: ['Más espacio para piernas', 'Embarque prioritario', 'Atención preferencial'],
      filas: '8-14',
      color: '#17a2b8'
    },
    business: {
      nombre: 'Business',
      precioBase: 2.0,
      caracteristicas: ['Asientos reclinables', 'Comida gourmet', 'Salas VIP', 'Embarque prioritario'],
      filas: '4-7',
      color: '#ffc107'
    },
    primera: {
      nombre: 'Primera Clase',
      precioBase: 3.5,
      caracteristicas: ['Suite privada', 'Comida chef', 'Chauffeur', 'Sala VIP premium'],
      filas: '1-3',
      color: '#dc3545'
    }
  };

  static obtenerClasePorFila(fila) {
    const numFila = parseInt(fila);
    if (numFila >= 1 && numFila <= 3) return 'primera';
    if (numFila >= 4 && numFila <= 7) return 'business';
    if (numFila >= 8 && numFila <= 14) return 'economicaPlus';
    return 'economica';
  }

  static calcularPrecio(clase, precioBase) {
    return Math.round(precioBase * this.clases[clase].precioBase);
  }

  static obtenerInfoClase(clase) {
    return this.clases[clase] || this.clases.economica;
  }
}

// Clase para manejar el sistema de asientos por clase
export class SistemaAsientos {
  static generarAsientos(filas = 10, clases = ['A', 'B', 'C', 'D']) {
    const asientos = [];
    for (let fila = 1; fila <= filas; fila++) {
      for (let clase of clases) {
        asientos.push(`${clase}${fila}`);
      }
    }
    return asientos;
  }

  static obtenerAsientosDisponibles(vuelo) {
    const todosAsientos = this.generarAsientos(vuelo.filas, vuelo.clases);
    const reservados = vuelo.asientosReservados || [];
    return todosAsientos.filter(asiento => !reservados.includes(asiento));
  }

  static validarAsiento(asiento) {
    const regex = /^[A-D][1-9][0-9]*$/;
    return regex.test(asiento);
  }
}

export default class BaseDatos {
  constructor(key = 'aero_premium_v1') {
    this.key = key;
    this._load();
  }

  _load() {
    const raw = localStorage.getItem(this.key);
    if (raw) {
      try {
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error parseando localStorage, inicializando datos por defecto', e);
        this.data = this._init();
        this._save();
      }
    } else {
      this.data = this._init();
      this._save();
    }
  }

  _save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  _init() {
    return {
      usuarios: [
        { 
          id: 'u1', 
          nombre: 'Agente Admin', 
          email: 'admin@vuela.com', 
          pass: 'admin123', 
          rol: 'admin',
          puntos: 5000
        }
      ],
      vuelos: [
        { 
          id: 'F1001', 
          numero: 'F1001', 
          origen: 'Santo Domingo (SDQ)', 
          destino: 'Punta Cana (PUJ)', 
          fecha: '2025-11-20', 
          aerolinea: 'AeroDominicana', 
          asientosTotales: 40, 
          asientosReservados: [], 
          precio: 60, 
          estado: 'A tiempo',
          clases: ['A', 'B', 'C', 'D'],
          filas: 10,
          puerta: 'A15'
        },
        { 
          id: 'F1002', 
          numero: 'F1002', 
          origen: 'Santo Domingo (SDQ)', 
          destino: 'Santiago (STI)', 
          fecha: '2025-11-21', 
          aerolinea: 'AeroCaribe', 
          asientosTotales: 40, 
          asientosReservados: [], 
          precio: 55, 
          estado: 'A tiempo',
          clases: ['A', 'B', 'C', 'D'],
          filas: 10,
          puerta: 'B22'
        },
        { 
          id: 'F3001', 
          numero: 'F3001', 
          origen: 'Santo Domingo (SDQ)', 
          destino: 'New York (JFK)', 
          fecha: '2025-11-30', 
          aerolinea: 'IslandAir', 
          asientosTotales: 40, 
          asientosReservados: [], 
          precio: 320, 
          estado: 'A tiempo',
          clases: ['A', 'B', 'C', 'D'],
          filas: 10,
          puerta: 'C08'
        },
      ],
      reservas: [],
      pagos: []
    };
  }

  // ===== USUARIOS =====
  obtenerUsuarios() { return this.data.usuarios || []; }

  // ✅ === MÉTODOS NUEVOS PARA VERIFICACIÓN DE EMAIL ===
  verificarEmailExistente(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailNormalizado = email.toLowerCase().trim();
    return (this.data.usuarios || []).some(user => 
      user.email && user.email.toLowerCase().trim() === emailNormalizado
    );
  }

  findUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    
    const emailNormalizado = email.toLowerCase().trim();
    return (this.data.usuarios || []).find(user => 
      user.email && user.email.toLowerCase().trim() === emailNormalizado
    );
  }

  agregarUsuario(u) {
    this.data.usuarios = this.data.usuarios || [];
    const id = `u${this.data.usuarios.length + 1}`;
    
    const nuevo = { 
        id, 
        nombre: u.nombre,
        email: u.email,
        password: u.password,
        rol: u.rol || 'cliente',
        isVerified: u.isVerified || false,
        createdAt: u.createdAt || new Date().toISOString(),
        puntos: 0 // ✅ NUEVO: Inicializar puntos
    };
    
    this.data.usuarios.push(nuevo);
    this._save();
    return nuevo;
  }

  actualizarUsuario(id, nuevosDatos) {
    const u = this.data.usuarios.find(x => x.id === id);
    if (!u) return false;
    Object.assign(u, nuevosDatos);
    this._save();
    return true;
  }

  eliminarUsuario(id) {
    this.data.usuarios = (this.data.usuarios || []).filter(u => u.id !== id);
    this._save();
    return true;
  }

  // ===== VUELOS =====
  obtenerVuelos() {
    this.data.vuelos = this.data.vuelos || [];
    return this.data.vuelos.map(v => new Vuelo(v));
  }

  findVueloById(id) {
    return this.data.vuelos.find(v => String(v.id) === String(id));
  }

  agregarVuelo(vuelo) {
    this.data.vuelos = this.data.vuelos || [];
    const id = vuelo.id || `F${Math.floor(Math.random() * 9000) + 1000}`;
    const numero = vuelo.numero || id;
    const precio = vuelo.precio ?? vuelo.tarifa ?? 0;
    const nuevo = {
      id,
      numero,
      origen: vuelo.origen || '',
      destino: vuelo.destino || '',
      fecha: vuelo.fecha || new Date().toISOString().slice(0, 10),
      aerolinea: vuelo.aerolinea || 'Indefinida',
      asientosTotales: vuelo.asientosTotales || 40,
      asientosReservados: vuelo.asientosReservados || [],
      clases: vuelo.clases || ['A', 'B', 'C', 'D'],
      filas: vuelo.filas || 10,
      puerta: vuelo.puerta || 'A01',
      precio,
      tarifa: precio,
      estado: vuelo.estado || 'A tiempo'
    };
    this.data.vuelos.push(nuevo);
    this._save();
    return nuevo;
  }

  actualizarVuelo(id, nuevosDatos) {
    const v = this.findVueloById(id);
    if (!v) return false;
    if (nuevosDatos.precio !== undefined) { v.precio = nuevosDatos.precio; v.tarifa = nuevosDatos.precio; }
    if (nuevosDatos.tarifa !== undefined) { v.tarifa = nuevosDatos.tarifa; v.precio = nuevosDatos.tarifa; }
    Object.assign(v, nuevosDatos);
    this._save();
    return true;
  }

  eliminarVuelo(id) {
    this.data.vuelos = (this.data.vuelos || []).filter(v => String(v.id) !== String(id));
    this._save();
    return true;
  }

  // ===== RESERVAS =====
  crearReserva(res) {
    this.data.reservas = this.data.reservas || [];
    const id = res.id || `R${Math.random().toString(36).slice(2,9)}`;
    const codigo = res.codigo || ('R' + Math.random().toString(36).slice(2,7).toUpperCase());
    const reserva = {
      id,
      codigo,
      clienteId: res.clienteId,
      vueloId: res.vueloId,
      asientos: res.asientos || [],
      fecha: res.fecha || new Date().toISOString(),
      total: res.total ?? 0,
      estado: res.estado || 'confirmada',
      pagoEstado: res.pagoEstado || 'pendiente',
      clase: res.clase || 'economica' // ✅ NUEVO: Guardar clase de reserva
    };
    this.data.reservas.push(reserva);

    // Marcar asientos en el vuelo
    const vuelo = this.findVueloById(reserva.vueloId);
    if (vuelo) {
      vuelo.asientosReservados = Array.from(new Set([...(vuelo.asientosReservados || []), ...reserva.asientos]));
    }

    this._save();
    return reserva;
  }

  crearReservaValida(reserva, showToast, renderReservas, actualizarEstadisticas) {
    const vuelo = this.findVueloById(reserva.vueloId);
    if (!vuelo) {
      showToast('Vuelo no encontrado', 'danger');
      return null;
    }

    // Verificar duplicados
    const duplicado = this.obtenerReservas().some(r =>
      r.clienteId === reserva.clienteId && r.vueloId === reserva.vueloId
    );
    if (duplicado) {
      showToast('Ya existe una reserva para este vuelo', 'danger');
      return null;
    }

    // Verificar asientos disponibles
    const asientosDisponibles = vuelo.asientosTotales - (vuelo.asientosReservados?.length || 0);
    if ((reserva.asientos?.length || 0) > asientosDisponibles) {
      showToast('No hay suficientes asientos disponibles', 'danger');
      return null;
    }

    // Crear reserva
    const nueva = this.crearReserva(reserva);
    showToast('Reserva creada correctamente');
    renderReservas();
    actualizarEstadisticas();
    return nueva;
  }

  obtenerReservas() {
    this.data.reservas = this.data.reservas || [];
    return this.data.reservas;
  }

  obtenerReservasByUser(userId) {
    return this.obtenerReservas().filter(r => r.clienteId === userId);
  }

  cancelarReserva(id) {
    this.data.reservas = this.data.reservas.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r);
    this._save();
    return true;
  }

  // ===== PAGOS =====
  registrarPago(p) {
    this.data.pagos = this.data.pagos || [];
    this.data.pagos.push(p);
    const r = this.data.reservas.find(x => x.id === p.reservaId);
    if (r) { r.pagoEstado = 'pagada'; r.transaccion = p.codigo || ''; }
    this._save();
    return p;
  }

  obtenerPagos() {
    this.data.pagos = this.data.pagos || [];
    return this.data.pagos;
  }
}