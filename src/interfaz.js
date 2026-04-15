// src/interfaz.js
// src/interfaz.js
import { listarVuelos, crearReserva, cancelarReserva, procesarPago } from './controladores.js';
import { supabaseService } from './services/supabaseService.js';

// El resto del código...

const container = document.getElementById('contenidoPrincipal');

const modalPagoEl = document.getElementById('modalPago');
let modalPago = null;
if (modalPagoEl) {
    modalPago = new bootstrap.Modal(modalPagoEl, { backdrop: 'static', keyboard: false });
}

/* --------------------------- Utilidades --------------------------- */
function toast(msg, type = 'primary') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const id = 't' + Math.random().toString(36).slice(2, 8);
    c.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2 show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    setTimeout(() => document.getElementById(id)?.remove(), 4500);
}

function getUser() {
    const u = sessionStorage.getItem('aero_user');
    return u ? JSON.parse(u) : null;
}

function normalize(s = '') {
    return String(s).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^\w\s]/g, '') 
        .trim();
}

/* --------------------------- Hero / Inicio --------------------------- */
function heroHtml() {
    const user = getUser();
    return `
    <div class="hero p-3 rounded-3 mb-3" style="background: linear-gradient(90deg, rgba(10,20,60,0.95), rgba(0,50,120,0.95)); color: white;">
            <div class="d-flex justify-content-between align-items-center">
                <!-- Navbar -->
                <span class="navbar-brand text-illuminated fw-bold fs-5" id="brand">
                        En el Cielo no hay Fronteras que Cierren Caminos 
                </span>

            <div class="text-end">
                ${user 
                    ? `<span class="me-2">👋 ${user.nombre}</span>
                       ${user.rol === "admin" ? '<button class="btn btn-warning btn-sm me-2" id="btn-admin">Administrar</button>' : ''}
                       <button class="btn btn-light btn-sm" id="btn-logout">Cerrar sesión</button>`
                    : `<button class="btn btn-light btn-sm" id="btn-login">Iniciar sesión</button>
                       <button class="btn btn-outline-light btn-sm" id="btn-register">Registrarse</button>`}
            </div>
        </div>

        <div class="mt-3 search-panel rounded p-3">
            <form id="form-busq" class="row g-2 align-items-end">
                <div class="col-md-3">
                    <label class="form-label small">Origen</label>
                    <input class="form-control" id="f-origen" value="Santo Domingo (SDQ)"/>
                </div>
                <div class="col-md-3">
                    <label class="form-label small">Destino</label>
                    <input class="form-control" id="f-destino" value="Punta Cana (PUJ)" />
                </div>
                <div class="col-md-2">
                    <label class="form-label small">Fecha</label>
                    <input type="date" class="form-control" id="f-fecha" value="2026-11-20"/>
                </div>
                <div class="col-md-2">
                    <label class="form-label small">Pasajeros</label>
                    <select class="form-select" id="f-pax">
                        <option>1</option><option>2</option><option>3</option>
                    </select>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-primary w-100" id="buscarBtn">Buscar vuelos</button>
                </div>
            </form>
        </div>
    </div>
    `;
}

/* --------------------------- Render Inicio --------------------------- */
export function renderInicio(container) {
    container.innerHTML = heroHtml() + `

    <section class="ofertas my-4">
        <h4 class="text-center mb-3 ofertas-titulo">Ofertas Especiales de la Semana</h4>
        <div class="row g-3">
        ${[
            {o:'Santo Domingo', d:'Paris', p:750, img:'paris'},
            {o:'Punta Cana', d:'New York', p:490, img:'newyork'},
            {o:'Santo Domingo', d:'Madrid', p:680, img:'madrid'},
            {o:'Santiago', d:'Miami', p:420, img:'miami'},
            {o:'Santo Domingo', d:'Buenos Aires', p:810, img:'buenosaires'},
            {o:'Punta Cana', d:'Londres', p:920, img:'london'},
            {o:'Santo Domingo', d:'Panama', p:250, img:'panama'},
            {o:'Santo Domingo', d:'Ciudad de Mexico', p:540, img:'mexico'},
            {o:'Santo Domingo', d:'Toronto', p:630, img:'toronto'},
            {o:'Santiago', d:'Madrid', p:700, img:'madrid2'},
            {o:'Punta Cana', d:'Toronto', p:600, img:'toronto2'},
            {o:'Santo Domingo', d:'Lisboa', p:650, img:'lisboa'},
            {o:'Santo Domingo', d:'Roma', p:720, img:'roma'},
            {o:'Santiago', d:'Miami', p:430, img:'miami2'},
            {o:'Punta Cana', d:'Chicago', p:560, img:'chicago'},
            {o:'Santo Domingo', d:'Cancun', p:470, img:'cancun'},
            {o:'Santo Domingo', d:'Berlin', p:800, img:'berlin'},
            {o:'Punta Cana', d:'Los Angeles', p:900, img:'losangeles'},
            {o:'Santo Domingo', d:'Tokio', p:1100, img:'tokyo'},
            {o:'Punta Cana', d:'Hong Kong', p:1200, img:'hongkong'},
            {o:'Santo Domingo', d:'Dubai', p:950, img:'dubai'},
            {o:'Santiago', d:'Barcelona', p:700, img:'barcelona'},
            {o:'Punta Cana', d:'Amsterdam', p:880, img:'amsterdam'},
            {o:'Santo Domingo', d:'Venecia', p:760, img:'venecia'},
            {o:'Santiago', d:'Lisboa', p:680, img:'lisboa2'},
            {o:'Santo Domingo', d:'Seul', p:1050, img:'seul'},
            {o:'Punta Cana', d:'Los Ángeles', p:910, img:'losangeles2'},
            {o:'Santo Domingo', d:'Moscu', p:850, img:'moscu'},
            {o:'Santiago', d:'París', p:780, img:'paris2'},
            {o:'Punta Cana', d:'Miami', p:430, img:'miami3'},
            {o:'Santo Domingo', d:'San Francisco', p:970, img:'sanfrancisco'},
            {o:'Santo Domingo', d:'Sydney', p:1500, img:'sydney'},
            {o:'Punta Cana', d:'Toronto', p:620, img:'toronto3'}
        ].map(item => `
        <div class="col-md-4 col-lg-3">
          <div class="card h-100 border-0 shadow-sm">
          <img src="https://picsum.photos/seed/${item.img}/600/300" class="card-img-top" alt="${item.d}">
          <div class="card-body text-center">
            <h6 class="card-title">${item.o} → ${item.d}</h6>
            <p class="text-muted small mb-1">Desde $${item.p} USD</p>
            <button class="btn btn-outline-primary btn-sm btn-reservar-oferta" 
                    data-origen="${item.o}" 
                    data-destino="${item.d}"
                    data-precio="${item.p}">
                Reservar ahora
            </button>
                </div>
              </div>
            </div>
        `).join('')}
        </div>
    </section>

        <div id="contenidoVuelos" class="mt-4"></div>
        <h6>Próximos vuelos</h6>

            <div class="row">
             <div class="col-lg-8">
                <div id="contenidoPrincipal"></div>
            </div>

         <div class="col-lg-15">
            <div class="departures-horizontal" id="sideDepartures">
                    
                    <div id="tableroSmall"></div>
            </div>
        </div>
</div>



<!-- Modal Reserva -->
<div class="modal fade" id="modalReservaOferta" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg border-0 rounded-3 overflow-hidden">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title">Confirmar Reserva</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body" id="contenidoReservaModal"></div>
        </div>
    </div>
</div>

<!-- Modal de Pago -->
<div class="modal fade" id="modalPago" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form id="formPago">
        <div class="modal-header">
          <h5 class="modal-title">Pagar Reserva</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="monto" class="form-label">Monto</label>
            <input type="number" step="0.01" name="monto" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre en tarjeta</label>
            <input type="text" name="nombre" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="numero" class="form-label">Número de tarjeta</label>
            <input type="text" name="numero" class="form-control" required>
          </div>
          <div class="row">
            <div class="col">
              <label for="exp" class="form-label">Expiración</label>
              <input type="text" name="exp" class="form-control" placeholder="MM/AA" required>
            </div>
            <div class="col">
              <label for="cvv" class="form-label">CVV</label>
              <input type="text" name="cvv" class="form-control" required>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Pagar</button>
        </div>
      </form>
    </div>
  </div>
</div>
    `;

    // Datos de todos los vuelos
 const todosVuelos = [
    {origen:'Santo Domingo', destino:'París', fecha:'2025-11-20', precio:750},
    {origen:'Punta Cana', destino:'New York', fecha:'2025-11-21', precio:490},
    {origen:'Santo Domingo', destino:'Madrid', fecha:'2025-11-22', precio:680},
    {origen:'Santiago', destino:'Miami', fecha:'2025-11-23', precio:420},
    {origen:'Santo Domingo', destino:'Buenos Aires', fecha:'2025-11-24', precio:810},
    {origen:'Punta Cana', destino:'Londres', fecha:'2025-11-25', precio:920},
    {origen:'Santo Domingo', destino:'Panamá', fecha:'2025-11-26', precio:250},
    {origen:'Santo Domingo', destino:'Ciudad de México', fecha:'2025-11-27', precio:540},
    {origen:'Santo Domingo', destino:'Toronto', fecha:'2025-11-28', precio:630},
    {origen:'Santiago', destino:'Madrid', fecha:'2025-11-29', precio:700},
    {origen:'Punta Cana', destino:'Toronto', fecha:'2025-11-30', precio:600},
    {origen:'Santo Domingo', destino:'Lisboa', fecha:'2025-12-01', precio:650}
    ];

 // Función para mostrar la tabla
    // Función para mostrar la tabla de vuelos desde Supabase
async function renderTablaVuelosAdmin() {
    const cont = document.getElementById('contenidoPrincipal');
    if (!cont) return;

    try {
        // Cargar vuelos reales desde Supabase
        const vuelosReales = await listarVuelos();
        
        if (!vuelosReales || vuelosReales.length === 0) {
            cont.innerHTML = `
                <div class="alert alert-info text-center">
                    No hay vuelos disponibles. Los administradores pueden agregar vuelos.
                </div>
                <button class="btn btn-secondary mt-2" id="btnCerrarTabla">Cerrar</button>
            `;
            document.getElementById('btnCerrarTabla')?.addEventListener('click', () => {
                cont.innerHTML = '';
            });
            return;
        }

        let html = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="text-white">📋 Todos los Vuelos Disponibles</h4>
            <button id="btnCerrarTabla" class="btn btn-sm btn-outline-light">Cerrar</button>
        </div>
        <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
        <table class="table table-striped table-hover text-white">
            <thead class="table-dark">
                <tr>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Fecha</th>
                    <th>Precio (USD)</th>
                    <th>Reservar</th>
                </tr>
            </thead>
            <tbody>
        `;

        for (const v of vuelosReales) {
            html += `
                <tr>
                    <td>${v.origen || 'N/A'}</td>
                    <td>${v.destino || 'N/A'}</td>
                    <td>${v.fecha || 'N/A'}</td>
                    <td>$${v.precio || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-reservar-vuelo" 
                                data-id="${v.id}"
                                data-origen="${v.origen}" 
                                data-destino="${v.destino}" 
                                data-fecha="${v.fecha}" 
                                data-precio="${v.precio}">
                            Reservar
                        </button>
                    </td>
                </tr>
            `;
        }

        html += `
            </tbody>
         </table>
        </div>
        `;

        cont.innerHTML = html;

        // Botón cerrar
        document.getElementById('btnCerrarTabla')?.addEventListener('click', () => {
            cont.innerHTML = '';
        });

        // Eventos de botones de reservar
        document.querySelectorAll('.btn-reservar-vuelo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const vueloId = e.target.dataset.id;
                // Buscar el vuelo real por ID
                const vueloReal = vuelosReales.find(v => v.id === vueloId);
                if (vueloReal) {
                    const vueloCompleto = {
                        ...vueloReal,
                        asientosTotales: 40,
                        asientosReservados: [],
                        clases: ['A', 'B', 'C', 'D'],
                        filas: 10,
                        aerolinea: 'AeroDominicana'
                    };
                    renderReservaModal(vueloCompleto);
                }
            });
        });

    } catch (error) {
        console.error('Error en renderTablaVuelosAdmin:', error);
        cont.innerHTML = `
            <div class="alert alert-danger text-center">
                Error cargando vuelos: ${error.message}
            </div>
            <button class="btn btn-secondary mt-2" id="btnCerrarTabla">Cerrar</button>
        `;
        document.getElementById('btnCerrarTabla')?.addEventListener('click', () => {
            cont.innerHTML = '';
        });
    }
    
}

// Listener del nav "Vuelos"
const navVuelos = document.getElementById('nav-vuelos');
if (navVuelos) {
    navVuelos.addEventListener('click', e => {
        e.preventDefault();

        const user = JSON.parse(sessionStorage.getItem('aero_user'));

        if (!user) {
            e.target.blur();
            toast("Debes iniciar sesión para ver los vuelos", "danger");
            const modalLogin = document.getElementById('modalLogin');
            const modal = new bootstrap.Modal(modalLogin);
            modal.show();
            return;
        }

        renderTablaVuelosAdmin();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

    // -------------------- LÓGICA DE BÚSQUEDA CON HIGHLIGHT --------------------
function limpiarInput(texto) {
    return texto.replace(/\s*\(.*\)/, '').trim().toLowerCase();
    }

    // ===== VERSIÓN CORREGIDA DE LA BÚSQUEDA (AHORA CON ASYNC) =====
    document.getElementById('buscarBtn')?.addEventListener('click', async function(e) {
        e.preventDefault();

        const origen = limpiarInput(document.getElementById('f-origen').value);
        const destino = limpiarInput(document.getElementById('f-destino').value);

        try {
            // Obtener vuelos reales de Supabase
            const vuelosReales = await listarVuelos();
            
            // Filtrar vuelos reales que coincidan
            const resultados = vuelosReales.filter(v => {
                if (!v.origen || !v.destino) return false;
                const vOrigen = v.origen.toLowerCase();
                const vDestino = v.destino.toLowerCase();
                return vOrigen.includes(origen) && vDestino.includes(destino);
            });

            const cont = document.querySelector('.ofertas .row.g-3');
            if (!cont) return;

            if (resultados.length === 0) {
                cont.innerHTML = `<p class="text-center w-100 text-white">❌ No se encontraron vuelos para esta búsqueda.</p>`;
            } else {
                cont.innerHTML = `<p class="text-center w-100 text-warning fw-bold mb-3">✈️ Vuelos encontrados:</p>` + 
                    resultados.map(v => `
                        <div class="col-md-4 col-lg-3">
                            <div class="card h-100 border-0 shadow-lg border-primary p-2">
                                <img src="https://picsum.photos/seed/${v.numero || 'vuelo'}/600/300" class="card-img-top" alt="${v.destino}">
                                <div class="card-body text-center">
                                    <h6 class="card-title text-primary fw-bold">${v.origen} → ${v.destino}</h6>
                                    <p class="text-muted small mb-1">$${v.precio} USD • ${v.fecha}</p>
                                    <button class="btn btn-outline-success btn-sm btn-reservar-oferta" 
                                            data-origen="${v.origen}" 
                                            data-destino="${v.destino}"
                                            data-precio="${v.precio}"
                                            data-id="${v.id}">
                                        Reservar ahora
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
            }

            // Reconfigurar botones
            await configurarBotonesOferta();
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            toast('Error al buscar vuelos', 'danger');
        }
    });

    document.getElementById('btn-login')?.addEventListener('click', () => 
        new bootstrap.Modal(document.getElementById('modalLogin')).show()
    );

    document.getElementById('btn-register')?.addEventListener('click', () => 
        new bootstrap.Modal(document.getElementById('modalRegister')).show()
    );

    document.getElementById('btn-admin')?.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('aero_user');
        toast('Sesión cerrada', 'info');
        renderInicio(container);
    });

    renderTableroSmall();

    // ===== VERSIÓN CORREGIDA DE LA CONFIGURACIÓN DE BOTONES =====
    // Llamar a la función asíncrona
    (async () => {
        await configurarBotonesOferta();
    })();

    // Verificar oferta pendiente
    (async () => {
        const ofertaPendiente = sessionStorage.getItem('ofertaPendiente');
        const user = getUser();
        if (ofertaPendiente && user) {
            try {
                const vuelos = await listarVuelos();
                // Intentar encontrar un vuelo que coincida
                if (vuelos.length > 0) {
                    renderReservaModal(vuelos[0]);
                    sessionStorage.removeItem('ofertaPendiente');
                }
            } catch (error) {
                console.error('Error cargando vuelo pendiente:', error);
            }
        }
    })();
}

// ===== NUEVA FUNCIÓN CONFIGURAR BOTONES OFERTA (AHORA ASYNC) =====
async function configurarBotonesOferta() {
    // Primero, obtener todos los vuelos reales para tener sus IDs
    const vuelosReales = await listarVuelos();
    
    document.querySelectorAll('.btn-reservar-oferta').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Si el botón ya tiene data-id, usarlo directamente
            if (btn.dataset.id) {
                const vueloReal = vuelosReales.find(v => v.id === btn.dataset.id);
                if (vueloReal) {
                    console.log('✅ Usando vuelo real:', vueloReal);
                    
                    const user = getUser();
                    if (!user) {
                        sessionStorage.setItem('ofertaPendiente', 'pendiente');
                        toast('Debes iniciar sesión para reservar', 'warning');
                        new bootstrap.Modal(document.getElementById('modalLogin')).show();
                        return;
                    }
                    
                    renderReservaModal(vueloReal);
                    return;
                }
            }
            
            // Si no tiene data-id, usar los datos del botón
            const origen = btn.dataset.origen;
            const destino = btn.dataset.destino;
            const precio = parseInt(btn.dataset.precio);

            console.log('🎫 OFERTA SELECCIONADA:', { origen, destino, precio });

            const user = getUser();
            if (!user) {
                sessionStorage.setItem('ofertaPendiente', destino);
                toast('Debes iniciar sesión para reservar esta oferta', 'warning');
                new bootstrap.Modal(document.getElementById('modalLogin')).show();
                return;
            }

            // Buscar si existe un vuelo real que coincida
            const vueloEncontrado = vuelosReales.find(v => 
                v.origen && v.destino &&
                v.origen.toLowerCase().includes(origen.toLowerCase()) && 
                v.destino.toLowerCase().includes(destino.toLowerCase())
            );

            if (vueloEncontrado) {
                console.log('✅ Vuelo real encontrado:', vueloEncontrado);
                renderReservaModal(vueloEncontrado);
            } else {
                // Si no hay vuelo real, crear uno temporal
                console.warn('⚠️ No se encontró vuelo real, usando datos simulados');
                const vueloTemporal = {
                    id: 'temp-' + Date.now(),
                    origen: origen,
                    destino: destino,
                    precio: precio,
                    asientosTotales: 40,
                    asientosReservados: [],
                    clases: ['A', 'B', 'C', 'D'],
                    filas: 10,
                    aerolinea: 'AeroPremium International',
                    numero: 'OF' + Math.floor(Math.random() * 1000),
                    fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    puerta: 'A' + Math.floor(Math.random() * 30) + 1
                };
                
                toast('Este es un vuelo de oferta simulado. Para reservas reales, usa los vuelos de la búsqueda.', 'info');
                renderReservaModal(vueloTemporal);
            }
        });
    });
}

/* ==================== SISTEMA DE ASIENTOS POR CLASE ==================== */

// Función para generar asientos disponibles
function generarAsientosDisponibles(vuelo, booked) {
    const asientos = [];
    const clases = vuelo.clases || ['A', 'B', 'C', 'D'];
    const filas = vuelo.filas || 10;
    
    for (let fila = 1; fila <= filas; fila++) {
        for (let clase of clases) {
            asientos.push(`${clase}${fila}`);
        }
    }
    return asientos;
}

// Función para generar el layout visual de asientos
function generarLayoutAsientos(asientosDisponibles, booked) {
    const clases = ['A', 'B', 'C', 'D'];
    const filas = 10;
    let html = '';
    
    for (let fila = 1; fila <= filas; fila++) {
        html += `<div class="seat-row mb-2 d-flex justify-content-center align-items-center">`;
        html += `<div class="row-number me-2 fw-bold text-white">${fila}</div>`;
        
        for (let clase of clases) {
            const asiento = `${clase}${fila}`;
            const estaOcupado = booked.includes(asiento);
            const estaDisponible = asientosDisponibles.includes(asiento);
            let seatClass = 'seat';
            
            if (estaOcupado) {
                seatClass += ' occupied';
            } else if (estaDisponible) {
                seatClass += ' available';
            } else {
                seatClass += ' unavailable';
            }
            
            // Agregar separación entre B y C (pasillo)
            if (clase === 'C') {
                html += `<div class="aisle-spacer"></div>`;
            }
            
            html += `<div class="${seatClass}" data-seat="${asiento}" data-fila="${fila}" data-clase="${clase}">
                ${asiento}
            </div>`;
        }
        
        html += `</div>`;
    }
    
    return html;
}

// Configurar eventos de los asientos
function configurarEventosAsientos(selected, vuelo) {
    document.querySelectorAll('.seat.available').forEach(asientoEl => {
        asientoEl.addEventListener('click', () => {
            const numeroAsiento = asientoEl.dataset.seat;
            
            if (selected.has(numeroAsiento)) {
                // Deseleccionar
                selected.delete(numeroAsiento);
                asientoEl.classList.remove('selected');
            } else {
                // Seleccionar
                selected.add(numeroAsiento);
                asientoEl.classList.add('selected');
            }
            
            actualizarResumenSeleccion(selected, vuelo);
        });
    });
}

// Actualizar resumen de selección
function actualizarResumenSeleccion(selected, vuelo) {
    const listaElement = document.getElementById('selectedSeatsList');
    const totalElement = document.getElementById('selectedSeatsTotal');
    
    if (!listaElement || !totalElement) return;
    
    const asientosArray = Array.from(selected);
    
    if (asientosArray.length === 0) {
        listaElement.textContent = 'Ninguno';
        totalElement.textContent = 'Total: $0';
    } else {
        listaElement.textContent = asientosArray.join(', ');
        const total = asientosArray.length * (vuelo.precio || vuelo.tarifa || 0);
        totalElement.textContent = `Total: $${total}`;
    }
}

/* --------------------------- Modal Reserva CON CLASES PREMIUM --------------------------- */
function renderReservaModal(vuelo) {
    console.log('🔍 MODAL RESERVA PREMIUM: Iniciando reserva para vuelo:', vuelo);
    
    // VERIFICAR: Asegurarnos que estamos recibiendo los datos correctos
    console.log('📊 Datos del vuelo recibidos:', {
        origen: vuelo.origen,
        destino: vuelo.destino,
        precio: vuelo.precio,
        id: vuelo.id
    });
    
    const booked = vuelo.asientosReservados || [];
    const asientosDisponibles = generarAsientosDisponibles(vuelo, booked);
    const user = getUser();
    
    const cont = document.getElementById('contenidoReservaModal');
    if (!cont) return;

    // USAR LOS DATOS REALES DEL VUELO, NO DATOS FIJOS
    cont.innerHTML = `
        <div class="reserva-modal-content">
            <h5 class="mb-3 text-center text-white">${vuelo.origen || 'Origen'} → ${vuelo.destino || 'Destino'}</h5>
            
            <div class="flight-info mb-3 p-3 bg-light rounded">
                <div class="row text-center">
                    <div class="col-md-3">
                        <small class="text-muted">Vuelo</small>
                        <div class="fw-bold" style="color: #ff9900;">${vuelo.numero || vuelo.id || 'N/A'}</div>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">Fecha</small>
                        <div class="fw-bold" style="color: #ff9900;">${vuelo.fecha || 'Fecha disponible'}</div>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">Aerolínea</small>
                        <div class="fw-bold" style="color: #ff9900;">${vuelo.aerolinea || 'Airline Reservations'}
                    </div>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">Precio base</small>
                        <div class="fw-bold" style="color: #ff9900;">${vuelo.precio || vuelo.tarifa || 0} USD</div>
                    </div>
                </div>
            </div>
            
            <!-- Selector de Clases -->
            <div class="clase-selector">
                <h6 class="text-center mb-3 text-white">Selecciona tu clase</h6>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <div class="clase-option clase-economica selected" data-clase="economica">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Económica</strong>
                                    <div class="clase-caracteristicas">Asiento estándar + Servicio básico</div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">$${vuelo.precio || vuelo.tarifa || 0}</div>
                                    <small class="text-muted">por persona</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-2">
                        <div class="clase-option clase-economicaPlus" data-clase="economicaPlus">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Económica Plus</strong>
                                    <div class="clase-caracteristicas">Más espacio + Embarque prioritario</div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">$${Math.round((vuelo.precio || vuelo.tarifa || 0) * 1.3)}</div>
                                    <small class="text-muted">por persona</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-2">
                        <div class="clase-option clase-business" data-clase="business">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Business</strong>
                                    <div class="clase-caracteristicas">Asientos reclinables + Comida gourmet</div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">$${Math.round((vuelo.precio || vuelo.tarifa || 0) * 2.0)}</div>
                                    <small class="text-muted">por persona</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-2">
                        <div class="clase-option clase-primera" data-clase="primera">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Primera Clase</strong>
                                    <div class="clase-caracteristicas">Suite privada + Servicio premium</div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">$${Math.round((vuelo.precio || vuelo.tarifa || 0) * 3.5)}</div>
                                    <small class="text-muted">por persona</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Mapa del Avión -->
            <div class="aircraft-model">
                <div class="overhead-bins"></div>
                <div class="cabin-sections">
                    <div class="cabin-section section-primera">
                        <div class="section-label">Primera</div>
                        <small class="text-white">Filas 1-3</small>
                    </div>
                    <div class="cabin-section section-business">
                        <div class="section-label">Business</div>
                        <small class="text-white">Filas 4-7</small>
                    </div>
                    <div class="cabin-section section-economica-plus">
                        <div class="section-label">Económica+</div>
                        <small class="text-white">Filas 8-14</small>
                    </div>
                    <div class="cabin-section section-economica">
                        <div class="section-label">Económica</div>
                        <small class="text-white">Filas 15-30</small>
                    </div>
                </div>
            </div>
            
            <div class="seat-selection-container">
                <h6 class="text-center mb-3 text-white">Selecciona tus asientos</h6>
                
                <!-- Leyenda Mejorada -->
                <div class="seat-legend mb-3 d-flex justify-content-center gap-3 flex-wrap">
                    <div class="d-flex align-items-center">
                        <div class="seat available me-2"></div>
                        <small class="text-white">Disponible</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="seat selected me-2"></div>
                        <small class="text-white">Seleccionado</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="seat occupied me-2"></div>
                        <small class="text-white">Ocupado</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="seat premium me-2"></div>
                        <small class="text-white">Premium</small>
                    </div>
                </div>
                
                <!-- Mapa de asientos premium -->
                <div class="seat-map-3d">
                    <div class="airplane-cabin text-center mb-4">
                        <div class="cockpit mb-3">
                            <div class="cockpit-shape">✈️ CABINA DE PILOTOS</div>
                        </div>
                        
                        <!-- Asientos organizados por clase -->
                        <div class="seat-layout">
                            ${generarLayoutAsientosPremium(asientosDisponibles, booked)}
                        </div>
                        
                        <div class="aisle-indicator mt-3">
                            <div class="aisle-line"></div>
                            <small class="text-muted">PASILLO</small>
                            <div class="aisle-line"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Resumen de selección mejorado -->
                <div class="selection-summary">
                    <h6 class="mb-2">Resumen de tu selección</h6>
                    <div id="selectedSeatsList" class="fw-bold">Ningún asiento seleccionado</div>
                    <div id="selectedSeatsTotal" class="small">Total: $0</div>
                    <div id="selectedClassInfo" class="small price-breakdown"></div>
                </div>
            </div>
            
            <div class="d-flex gap-2 justify-content-end mt-4">
                <button class="btn btn-outline-secondary" id="cancelReserveModal">Volver</button>
                <button class="btn btn-success" id="confirmReserveModal">
                    <i class="bi bi-credit-card me-2"></i>Confirmar y pagar
                </button>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalReservaOferta'));
    const selected = new Set();
    let claseSeleccionada = 'economica';

    // Configurar selección de clase
    configurarSeleccionClaseSimple(selected, vuelo, claseSeleccionada);
    // Configurar eventos de asientos
    configurarEventosAsientosSimple(selected, vuelo, claseSeleccionada);

    cont.querySelector('#cancelReserveModal')?.addEventListener('click', () => modal.hide());

    cont.querySelector('#confirmReserveModal')?.addEventListener('click', () => {
        confirmarReservaSimple(selected, vuelo, user, modal, claseSeleccionada);
    });

    modal.show();
}

/* --------------------------- Reserva en contenido principal --------------------------- */
function renderReserva(container, vueloId) {
    (async () => {
        const vuelo = await supabaseService.findVueloById(vueloId);
        if (!vuelo) { toast('Vuelo no encontrado', 'danger'); return; }

        const booked = vuelo.asientosReservados || [];
        const asientosDisponibles = generarAsientosDisponibles(vuelo, booked);
        
        const cont = container.querySelector('#contenidoPrincipal');
        if (!cont) return;

        cont.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="text-white">${vuelo.origen} → ${vuelo.destino}</h5>
                    
                    <div class="flight-info mb-3 p-3 bg-light rounded">
                        <div class="row text-center">
                            <div class="col-md-4">
                                <small class="text-muted">Vuelo</small>
                                <div class="fw-bold">${vuelo.numero}</div>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">Fecha</small>
                                <div class="fw-bold">${vuelo.fecha}</div>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">Precio por asiento</small>
                                <div class="fw-bold">$${vuelo.precio || vuelo.tarifa || 0}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="seat-selection-container">
                        <h6 class="text-center mb-3 text-white">Selecciona tus asientos</h6>
                        
                        <div class="seat-legend mb-3 d-flex justify-content-center gap-3">
                            <div class="d-flex align-items-center">
                                <div class="seat available me-2"></div>
                                <small class="text-white">Disponible</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="seat selected me-2"></div>
                                <small class="text-white">Seleccionado</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="seat occupied me-2"></div>
                                <small class="text-white">Ocupado</small>
                            </div>
                        </div>
                        
                        <div class="airplane-cabin text-center mb-4">
                            <div class="cockpit mb-3">
                                <div class="cockpit-shape">✈️ CABINA</div>
                            </div>
                            
                            <div class="seat-layout">
                                ${generarLayoutAsientos(asientosDisponibles, booked)}
                            </div>
                            
                            <div class="aisle-indicator mt-3">
                                <div class="aisle-line"></div>
                                <small class="text-muted">PASILLO</small>
                                <div class="aisle-line"></div>
                            </div>
                        </div>
                        
                        <div class="selected-seats-summary mb-3 p-3 bg-info text-white rounded">
                            <h6 class="mb-2">Asientos seleccionados:</h6>
                            <div id="selectedSeatsList" class="fw-bold">Ninguno</div>
                            <div id="selectedSeatsTotal" class="small">Total: $0</div>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button class="btn btn-success" id="confirmReserve">Confirmar y pagar</button>
                        <button class="btn btn-outline-secondary" id="back">Volver</button>
                    </div>
                </div>
            </div>
        `;

        const selected = new Set();
        configurarEventosAsientos(selected, vuelo);

        cont.querySelector('#back')?.addEventListener('click', () => renderVuelos(container));

        cont.querySelector('#confirmReserve')?.addEventListener('click', () => {
            if (selected.size === 0) { 
                toast('Selecciona asientos', 'warning'); 
                return; 
            }
            const user = getUser();
            if (!user) { 
                toast('Inicia sesión para reservar', 'warning'); 
                new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
                return; 
            }
            const asientos = Array.from(selected);
            (async () => {
                const res = await crearReserva({ clienteId: user.id, vueloId, asientos });
                if (!res || !res.ok) { toast('Error creando reserva', 'danger'); return; }
                abrirPago(res.reserva.id);
            })();
        });
    })();
}

/* --------------------------- Función auxiliar para mostrar pago --------------------------- */
function abrirPago(reservaId) {
    const user = getUser();
    if (!user) { 
        toast('Inicia sesión para pagar', 'warning'); 
        new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
        return; 
    }

    const formPago = document.getElementById('formPago');
    if (!formPago) return;

    formPago.dataset.reservaId = reservaId;
    formPago.reset();

    const modalPago = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago'));
    modalPago.show();
}

/* --------------------------- Pago directo (para reservas existentes) --------------------------- */
function abrirPagoDirecto(reservaId, monto) {
    const user = getUser();
    if (!user) { 
        toast('Inicia sesión para pagar', 'warning'); 
        new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
        return; 
    }

    console.log('💰 Abriendo pago directo para reserva:', reservaId, 'monto:', monto);

    const formPago = document.getElementById('formPago');
    if (!formPago) {
        console.error('❌ No se encontró el formulario de pago');
        toast('Error al abrir el formulario de pago', 'danger');
        return;
    }

    // Configurar el formulario para pago directo
    const montoInput = formPago.querySelector('input[name="monto"]');
    if (montoInput) {
        montoInput.value = monto || '';
        montoInput.readOnly = true; // El monto no se puede editar
    }

    // Guardar el ID de la reserva y marcar que es pago directo
    formPago.dataset.reservaId = reservaId;
    formPago.dataset.tipoPago = 'directo'; // Indicador de pago directo
    
    // Limpiar otros campos (nombre, tarjeta, etc.)
    const nombreInput = formPago.querySelector('input[name="nombre"]');
    const numeroInput = formPago.querySelector('input[name="numero"]');
    const expInput = formPago.querySelector('input[name="exp"]');
    const cvvInput = formPago.querySelector('input[name="cvv"]');
    
    if (nombreInput) nombreInput.value = '';
    if (numeroInput) numeroInput.value = '';
    if (expInput) expInput.value = '';
    if (cvvInput) cvvInput.value = '';
    
    // Restaurar el monto después del reset (por si acaso)
    if (montoInput && monto) {
        montoInput.value = monto;
    }

    const modalPago = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago'));
    modalPago.show();
    
    console.log('✅ Modal de pago directo abierto');
}

/* --------------------------- Vuelos --------------------------- */
export async function renderVuelos(container) {
    const vuelos = await listarVuelos();
    const html = vuelos.map(v => `
        <div class="card mb-3 card-flight">
            <img src="https://picsum.photos/seed/${v.numero}/800/200" class="card-img-top" alt="destino"/>
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold text-white">${v.origen} → ${v.destino}</div>
                    <div class="small text-muted">${v.aerolinea || ''} • ${new Date(v.fecha).toLocaleDateString()}</div>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-white">$${v.precio}</div>
                    <button class="btn btn-sm btn-outline-primary" data-id="${v.id}">Reservar</button>
                </div>
            </div>
        </div>
    `).join('');

    const cont = container.querySelector('#contenidoPrincipal');
    if (cont) cont.innerHTML = `<h5 class="text-white">Resultados</h5>${html}`;

    container.querySelectorAll('.card button[data-id]').forEach(b => {
        b.addEventListener('click', e => {
            const user = getUser();
            if (!user) { toast('Debes iniciar sesión', 'warning'); new bootstrap.Modal(document.getElementById('modalLogin')).show(); return; }
            const id = e.target.getAttribute('data-id');
            renderReserva(container, id);
        });
    });
}

/* --------------------------- Mis Reservas --------------------------- */
export async function renderMisReservas(container) {
    const user = getUser();
    if (!user) { toast('Inicia sesión para ver reservas', 'warning'); new bootstrap.Modal(document.getElementById('modalLogin')).show(); return; }

    const reservas = await supabaseService.obtenerReservasByUser(user.id);
    const cont = container.querySelector('#contenidoPrincipal');
    if (!cont) return;

    if (!reservas.length) { cont.innerHTML = '<div class="alert alert-info">No tienes reservas</div>'; return; }

    const html = reservas.map(r => `
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-semibold">${r.codigo}</div>
                    <div class="small text-muted">Vuelo: ${r.vueloId}</div>
                    <div class="small text-muted">Fecha: ${new Date(r.fecha).toLocaleString()}</div>
                </div>
                <div>
                    <div class="small">Estado: ${r.estado}</div>
                    <button class="btn btn-sm btn-outline-danger" data-id="${r.id}">Cancelar</button>
                </div>
            </div>
        </div>
    `).join('');

    cont.innerHTML = `<h5 class="text-white">Mis Reservas</h5>${html}`;

    cont.querySelectorAll('button[data-id]').forEach(b => {
        b.addEventListener('click', async e => {
            const id = e.target.getAttribute('data-id');
            const res = await cancelarReserva(id);
            if (res.ok) { toast('Reserva cancelada', 'info'); renderMisReservas(container); }
            else toast('Error al cancelar', 'danger');
        });
    });
}

/* --------------------------- Tablero pequeño (side) --------------------------- */
async function renderTableroSmall() {
    const vuelos = await listarVuelos();
    const primerosVuelos = vuelos.slice(0, 10);

    const html = primerosVuelos.map(v => `
        <div class="small text-white mb-1">
            <strong>${v.numero}</strong> ${v.origen} → ${v.destino}
            <span class="text-light">
                ${v.hora_salida || '08:00'}
            </span>
        </div>
    `).join('');

    const el = document.getElementById('tableroSmall');
    if (el) el.innerHTML = html;
}

// Inicializar tablero
(async () => {
    await renderTableroSmall();
})();

/* --------------------------- Panel Administrativo --------------------------- */
export async function renderAdminPanel(container) {
    const user = getUser();
    if (!user || user.rol !== "admin") { toast("Acceso denegado: solo administradores", "danger"); return; }

    const vuelos = await listarVuelos();
    const reservas = await supabaseService.obtenerReservas();

    // Aquí puedes agregar la lógica para mostrar el panel admin
    container.innerHTML = `
        <div class="container">
            <h2 class="text-white">Panel de Administración</h2>
            <p class="text-white">Bienvenido, ${user.nombre}</p>
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Vuelos Activos: ${vuelos.length}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Reservas: ${reservas.length}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* ==================== FUNCIONES SIMPLIFICADAS PARA CLASES PREMIUM ==================== */

// Función simplificada para configurar selección de clase
function configurarSeleccionClaseSimple(selected, vuelo, claseInicial) {
    document.querySelectorAll('.clase-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('.clase-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Agregar selección nueva
            this.classList.add('selected');
            
            // Actualizar clase seleccionada
            window.claseSeleccionada = this.dataset.clase;
            
            // Recalcular precios y actualizar resumen
            actualizarResumenSeleccionSimple(selected, vuelo, window.claseSeleccionada);
        });
    });
    
    // Seleccionar clase inicial
    const optionInicial = document.querySelector(`.clase-option[data-clase="${claseInicial}"]`);
    if (optionInicial) {
        optionInicial.classList.add('selected');
        window.claseSeleccionada = claseInicial;
    }
}

// Función simplificada para generar layout de asientos premium
function generarLayoutAsientosPremium(asientosDisponibles, booked) {
    const clases = ['A', 'B', 'C', 'D'];
    const filas = 10;
    let html = '';
    
    for (let fila = 1; fila <= filas; fila++) {
        const claseFila = obtenerClasePorFilaSimple(fila);
        html += `<div class="seat-row mb-2 d-flex justify-content-center align-items-center">`;
        html += `<div class="row-number me-2 fw-bold text-white">${fila}</div>`;
        
        for (let clase of clases) {
            const asiento = `${clase}${fila}`;
            const estaOcupado = booked.includes(asiento);
            const estaDisponible = asientosDisponibles.includes(asiento);
            let seatClass = 'seat';
            
            if (estaOcupado) {
                seatClass += ' occupied';
            } else if (estaDisponible) {
                seatClass += ' available';
                // Agregar clases especiales según la fila
                if (claseFila === 'primera') {
                    seatClass += ' premium primera-clase';
                } else if (claseFila === 'business') {
                    seatClass += ' premium business-class';
                } else if (claseFila === 'economicaPlus') {
                    seatClass += ' premium economica-plus';
                }
            } else {
                seatClass += ' unavailable';
            }
            
            // Agregar separación entre B y C (pasillo)
            if (clase === 'C') {
                html += `<div class="aisle-spacer"></div>`;
            }
            
            html += `<div class="${seatClass}" data-seat="${asiento}" data-fila="${fila}" data-clase="${clase}">
                ${asiento}
            </div>`;
        }
        
        html += `</div>`;
    }
    
    return html;
}

// Función simplificada para obtener clase por fila
function obtenerClasePorFilaSimple(fila) {
    if (fila <= 3) return 'primera';
    if (fila <= 7) return 'business';
    if (fila <= 14) return 'economicaPlus';
    return 'economica';
}

// Función simplificada para configurar eventos de asientos
function configurarEventosAsientosSimple(selected, vuelo, clase) {
    window.selectedSeats = selected;
    window.currentVuelo = vuelo;

    document.querySelectorAll('.seat.available').forEach(asientoEl => {
        asientoEl.addEventListener('click', () => {
            const numeroAsiento = asientoEl.dataset.seat;
            const _fila = parseInt(asientoEl.dataset.fila);

            if (selected.has(numeroAsiento)) {
                // Deseleccionar
                selected.delete(numeroAsiento);
                asientoEl.classList.remove('selected');
            } else {
                // Seleccionar
                selected.add(numeroAsiento);
                asientoEl.classList.add('selected');
            }
            
            actualizarResumenSeleccionSimple(selected, vuelo, clase);
        });
    });
}

// Función simplificada para actualizar resumen
function actualizarResumenSeleccionSimple(selected, vuelo, clase) {
    const listaElement = document.getElementById('selectedSeatsList');
    const totalElement = document.getElementById('selectedSeatsTotal');
    const classInfoElement = document.getElementById('selectedClassInfo');
    
    if (!listaElement || !totalElement || !classInfoElement) return;
    
    const asientosArray = Array.from(selected);
    const precioBase = vuelo.precio || vuelo.tarifa || 0;
    
    // Calcular precio según clase seleccionada
    let precioPorAsiento;
    switch(clase) {
        case 'economicaPlus':
            precioPorAsiento = Math.round(precioBase * 1.3);
            break;
        case 'business':
            precioPorAsiento = Math.round(precioBase * 2.0);
            break;
        case 'primera':
            precioPorAsiento = Math.round(precioBase * 3.5);
            break;
        default:
            precioPorAsiento = precioBase;
    }
    
    const total = asientosArray.length * precioPorAsiento;
    
    if (asientosArray.length === 0) {
        listaElement.textContent = 'Ningún asiento seleccionado';
        totalElement.textContent = 'Total: $0';
        classInfoElement.textContent = '';
    } else {
        listaElement.textContent = asientosArray.join(', ');
        totalElement.textContent = `Total: $${total}`;
        
        // Obtener nombre de la clase
        let nombreClase = 'Económica';
        if (clase === 'economicaPlus') nombreClase = 'Económica Plus';
        if (clase === 'business') nombreClase = 'Business';
        if (clase === 'primera') nombreClase = 'Primera Clase';
        
        classInfoElement.textContent = `${asientosArray.length} asiento(s) en ${nombreClase} - $${precioPorAsiento} c/u`;
    }
}

// Función simplificada para confirmar reserva
// Función simplificada para confirmar reserva - VERSIÓN CORREGIDA (NO guarda en BD)
// Función simplificada para confirmar reserva - GUARDA EN SUPABASE
async function confirmarReservaSimple(selected, vuelo, user, modal, clase) {
    if (selected.size === 0) {
        toast('Selecciona al menos un asiento', 'warning');
        return;
    }
    
    if (!user) {
        toast('Inicia sesión para reservar', 'warning');
        new bootstrap.Modal(document.getElementById('modalLogin')).show();
        return;
    }
    
    if (vuelo.id && vuelo.id.toString().startsWith('temp-')) {
        toast('Este es un vuelo de oferta simulado. Para reservar, usa los vuelos de la búsqueda.', 'warning');
        return;
    }

    const asientos = Array.from(selected);
    const precioBase = vuelo.precio || vuelo.tarifa || 0;
    let multiplicador = 1;
    if (clase === 'economicaPlus') multiplicador = 1.3;
    else if (clase === 'business') multiplicador = 2.0;
    else if (clase === 'primera') multiplicador = 3.5;
    
    const total = Math.round(asientos.length * precioBase * multiplicador);

    // ✅ GUARDAR EN SUPABASE (no en sessionStorage)
    toast('Guardando reserva...', 'info');
    
    const reservaGuardada = await supabaseService.guardarReservaPendiente({
        clienteId: user.id,
        vueloId: vuelo.id,
        asientos: asientos,
        total: total,
        clase: clase
    });
    
    if (!reservaGuardada) {
        toast('Error al guardar la reserva', 'danger');
        return;
    }
    
    console.log('✅ Reserva pendiente guardada en Supabase:', reservaGuardada);

    modal.hide();
    
    // Abrir modal de pago
    setTimeout(() => {
        const formPago = document.getElementById('formPago');
        if (formPago) {
            formPago.reset();
            const montoInput = formPago.querySelector('input[name="monto"]');
            if (montoInput) {
                montoInput.value = total;
                montoInput.readOnly = true;
            }
            // Guardar el ID de la reserva pendiente
            formPago.dataset.reservaPendienteId = reservaGuardada.id;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago')).show();
        }
    }, 400);
}

/* --------------------------- Render Pagos --------------------------- */
export async function renderPagos(container = document.getElementById('app')) {
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) {
        toast('Debes iniciar sesión para ver tus pagos', 'warning');
        return;
    }

    try {
        console.log('🔍 Cargando pagos para usuario:', user.id);
        
        // Intentar obtener pagos, si falla mostrar array vacío
        let pagos = [];
        try {
            pagos = await supabaseService.obtenerPagosByUser(user.id) || [];
        } catch (error) {
            console.warn('Error obteniendo pagos, mostrando vacío:', error);
            pagos = [];
        }

        // También obtener reservas para mostrar información adicional
        let reservas = [];
        try {
            reservas = await supabaseService.obtenerReservasByUser(user.id) || [];
        } catch (error) {
            console.warn('Error obteniendo reservas:', error);
            reservas = [];
        }

        container.innerHTML = `
            <div class="container my-4">
                <h3 class="mb-4 text-primary"><i class="bi bi-credit-card"></i> Historial de Pagos</h3>
                
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card text-white bg-primary">
                            <div class="card-body">
                                <h5 class="card-title">Total Pagado</h5>
                                <p class="card-text display-6">$${pagos.reduce((sum, p) => sum + (p.monto || 0), 0)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-white bg-success">
                            <div class="card-body">
                                <h5 class="card-title">Pagos Realizados</h5>
                                <p class="card-text display-6">${pagos.length}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-white bg-info">
                            <div class="card-body">
                                <h5 class="card-title">Reservas Activas</h5>
                                <p class="card-text display-6">${reservas.filter(r => r.estado !== 'cancelada').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0">Listado de Pagos</h5>
                            </div>
                            <div class="card-body">
                                ${pagos.length > 0 ? `
                                    <div class="table-responsive">
                                        <table class="table table-striped table-hover">
                                            <thead class="table-dark">
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Reserva</th>
                                                    <th>Monto</th>
                                                    <th>Fecha</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${pagos.map(p => `
                                                    <tr>
                                                        <td><span class="badge bg-primary">${p.codigo || p.id.substring(0, 8)}</span></td>
                                                        <td>${p.reservaId ? p.reservaId.substring(0, 8) : 'N/A'}</td>
                                                        <td><strong>$${p.monto || 0}</strong></td>
                                                        <td>${p.fecha ? new Date(p.fecha).toLocaleDateString() : 'N/A'}</td>
                                                        <td><span class="badge bg-success">Completado</span></td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : `
                                    <div class="text-center py-5">
                                        <i class="bi bi-credit-card" style="font-size: 3rem; color: #ccc;"></i>
                                        <p class="mt-3 text-muted">Aún no has realizado ningún pago.</p>
                                        <p class="text-muted small">Los pagos aparecerán aquí una vez que reserves y pagues un vuelo.</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error cargando pagos:', error);
        container.innerHTML = `
            <div class="container my-4">
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No se pudieron cargar los pagos. Esto puede deberse a que:
                    <ul class="mt-2">
                        <li>No has realizado ningún pago todavía</li>
                        <li>Hay un problema de conexión con la base de datos</li>
                    </ul>
                    <button class="btn btn-primary btn-sm mt-2" onclick="window.location.reload()">
                        <i class="bi bi-arrow-repeat"></i> Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

// ===== FUNCIÓN PARA CARGAR OFERTAS CON VUELOS REALES =====
async function cargarOfertasConVuelosReales() {
    try {
        const vuelosReales = await listarVuelos();
        const contOfertas = document.querySelector('.ofertas .row.g-3');
        if (!contOfertas) return;
        
        // Tomar los primeros 12 vuelos como ofertas
        const ofertasReales = vuelosReales.slice(0, 16);
        
        if (ofertasReales.length > 0) {
            contOfertas.innerHTML = ofertasReales.map(v => `
                <div class="col-md-4 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <img src="https://picsum.photos/seed/${v.numero}/600/300" class="card-img-top" alt="${v.destino}">
                        <div class="card-body text-center">
                            <h6 class="card-title">${v.origen} → ${v.destino}</h6>
                            <p class="text-muted small mb-1">Desde $${v.precio} USD</p>
                            <button class="btn btn-outline-primary btn-sm btn-reservar-oferta" 
                                    data-origen="${v.origen}" 
                                    data-destino="${v.destino}"
                                    data-precio="${v.precio}"
                                    data-id="${v.id}">
                                Reservar ahora
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Reconfigurar botones
            await configurarBotonesOferta();
        }
    } catch (error) {
        console.error('Error cargando ofertas reales:', error);
    }
}

// Después de configurar todos los event listeners, agrega:
(async () => {
    await cargarOfertasConVuelosReales();
})();

import { LoyaltyService } from './services/loyaltyService.js';

export async function renderPerfilUsuario(container) {
  const user = getUser();
  if (!user) {
    toast('Inicia sesión para ver tu perfil', 'warning');
    return;
  }
  
  const perfil = await LoyaltyService.getPerfilUsuario(user.id);
  if (perfil) {
    const usuarioCompleto = {
      ...user,
      puntos: perfil.puntos,
      nivel: perfil.nivel,
      proximoNivel: perfil.proximoNivel
    };
    
    container.innerHTML = LoyaltyService.renderTarjetaFidelidad(usuarioCompleto);
  }
}

// ===== EXPONER FUNCIONES GLOBALMENTE =====
window.abrirPago = abrirPago;
window.abrirPagoDirecto = abrirPagoDirecto;
window.procesarPago = procesarPago;

export default { renderInicio, renderVuelos, renderMisReservas, renderAdminPanel, renderPagos };