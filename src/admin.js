// src/admin.js - Panel Administrativo con Supabase
import { supabase } from './services/supabaseClient.js';

// ========== FUNCIÓN DE ENCRIPTACIÓN (misma que en authService) ==========
function encriptarPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
}

// ========== VERIFICAR ACCESO ADMIN ==========
const usuarioActual = JSON.parse(sessionStorage.getItem('aero_user'));

if (!usuarioActual || usuarioActual.rol !== 'admin') {
  alert('Acceso denegado. No tienes permisos de administrador.');
  window.location.href = 'index.html';
}

// Mostrar nombre del admin
document.getElementById('adminName').innerHTML = `<i class="bi bi-person-circle me-1"></i>${usuarioActual.nombre}`;

// Cerrar sesión
document.getElementById('btnCerrarSesion').addEventListener('click', () => {
  sessionStorage.removeItem('aero_user');
  window.location.href = 'index.html';
});

// ========== FUNCIONES ==========
function showToast(msg, tipo = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${tipo} border-0 show`;
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ========== VUELOS ==========
async function cargarVuelos() {
  const { data } = await supabase.from('vuelos').select('*').order('fecha');
  return data || [];
}

async function renderVuelos() {
  const vuelos = await cargarVuelos();
  const tbody = document.getElementById('tablaVuelos');
  document.getElementById('totalVuelos').textContent = vuelos.length;
  
  tbody.innerHTML = vuelos.map(v => `
    <tr>
      <td><small>${v.id.substring(0, 8)}</small></td>
      <td>${v.origen}</td>
      <td>${v.destino}</td>
      <td>${new Date(v.fecha).toLocaleDateString()}</td>
      <td>$${v.precio}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary editarVuelo" data-id="${v.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger eliminarVuelo" data-id="${v.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
  
  document.querySelectorAll('.editarVuelo').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { data: vuelo } = await supabase.from('vuelos').select('*').eq('id', btn.dataset.id).single();
      document.getElementById('vueloId').value = vuelo.id;
      document.getElementById('formVuelo').origen.value = vuelo.origen;
      document.getElementById('formVuelo').destino.value = vuelo.destino;
      document.getElementById('formVuelo').fecha.value = vuelo.fecha;
      document.getElementById('formVuelo').precio.value = vuelo.precio;
      new bootstrap.Modal(document.getElementById('modalVuelo')).show();
    });
  });
  
  document.querySelectorAll('.eliminarVuelo').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este vuelo?')) {
        await supabase.from('vuelos').delete().eq('id', btn.dataset.id);
        renderVuelos();
        showToast('Vuelo eliminado');
      }
    });
  });
}

// ========== RESERVAS ==========
async function renderReservas() {
  const { data: reservas } = await supabase
    .from('reservas')
    .select(`*, usuarios:usuario_id (nombre, email), vuelos:vuelo_id (origen, destino)`)
    .order('created_at', { ascending: false });
  
  const tbody = document.getElementById('tablaReservas');
  document.getElementById('totalReservas').textContent = reservas?.length || 0;
  
  // Calcular ganancias
  const { data: pagos } = await supabase.from('pagos').select('monto');
  const ganancias = pagos?.reduce((s, p) => s + (p.monto || 0), 0) || 0;
  document.getElementById('totalGanancias').textContent = `$${ganancias.toLocaleString()}`;
  
  if (!reservas?.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay reservas</td></tr>';
    return;
  }
  
  tbody.innerHTML = reservas.map(r => `
    <tr>
      <td><small>${r.id.substring(0, 8)}</small></td>
      <td>${r.usuarios?.nombre || 'N/A'}<br><small>${r.usuarios?.email || ''}</small></td>
      <td>${r.vuelos?.origen || ''} → ${r.vuelos?.destino || ''}</td>
      <td>${r.asientos?.join(', ') || 'N/A'}</td>
      <td>$${r.total || 0}</td>
      <td><span class="badge ${r.estado === 'pagada' ? 'bg-success' : r.estado === 'cancelada' ? 'bg-danger' : 'bg-warning'}">${r.estado || 'pendiente'}</span></td>
    </tr>
  `).join('');
}

// ========== USUARIOS ==========
async function renderUsuarios() {
  const { data: usuarios } = await supabase.from('usuarios').select('*').order('nombre');
  const { data: reservas } = await supabase.from('reservas').select('usuario_id');
  
  const tbody = document.getElementById('tablaUsuarios');
  document.getElementById('totalUsuarios').textContent = usuarios?.length || 0;
  
  if (!usuarios?.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios</td></tr>';
    return;
  }
  
  tbody.innerHTML = usuarios.map(u => {
    const reservasCount = reservas?.filter(r => r.usuario_id === u.id).length || 0;
    return `
      <tr>
        <td><small>${u.id.substring(0, 8)}</small></td>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td><span class="badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-primary'}">${u.rol || 'usuario'}</span></td>
        <td>${reservasCount}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary editarUsuario" data-id="${u.id}"><i class="bi bi-pencil"></i></button>
          ${u.rol !== 'admin' ? `<button class="btn btn-sm btn-outline-danger eliminarUsuario" data-id="${u.id}"><i class="bi bi-trash"></i></button>` : ''}
          <button class="btn btn-sm btn-outline-info cambiarRol" data-id="${u.id}" data-rol="${u.rol}"><i class="bi bi-shield"></i></button>
        </td>
      </tr>
    `;
  }).join('');
  
  document.querySelectorAll('.editarUsuario').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { data: u } = await supabase.from('usuarios').select('*').eq('id', btn.dataset.id).single();
      document.getElementById('usuarioId').value = u.id;
      document.getElementById('nombreUsuario').value = u.nombre;
      document.getElementById('emailUsuario').value = u.email;
      document.getElementById('rolUsuario').value = u.rol || 'usuario';
      document.getElementById('passwordUsuario').value = '';
      new bootstrap.Modal(document.getElementById('modalUsuario')).show();
    });
  });
  
  document.querySelectorAll('.eliminarUsuario').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este usuario?')) {
        await supabase.from('usuarios').delete().eq('id', btn.dataset.id);
        renderUsuarios();
        showToast('Usuario eliminado');
      }
    });
  });
  
  document.querySelectorAll('.cambiarRol').forEach(btn => {
    btn.addEventListener('click', async () => {
      const nuevoRol = btn.dataset.rol === 'admin' ? 'usuario' : 'admin';
      if (confirm(`¿Cambiar rol a ${nuevoRol}?`)) {
        await supabase.from('usuarios').update({ rol: nuevoRol }).eq('id', btn.dataset.id);
        renderUsuarios();
        showToast(`Rol cambiado a ${nuevoRol}`);
      }
    });
  });
}

// ========== EVENTOS ==========
// Formulario Vuelo
// Formulario Vuelo - VERSIÓN CORREGIDA
document.getElementById('formVuelo').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('vueloId').value;
  const data = {
    origen: e.target.origen.value,
    destino: e.target.destino.value,
    fecha: e.target.fecha.value,
    precio: Number(e.target.precio.value),
    numero: `VU${Math.floor(Math.random() * 9000) + 1000}`,
    hora_salida: '08:00:00',  // ← AGREGAR hora_salida (requerida)
    estado: 'A tiempo'         // ← AGREGAR estado
  };
  
  console.log('📝 Datos a guardar:', data);
  
  try {
    let result;
    if (id) {
      result = await supabase.from('vuelos').update(data).eq('id', id);
      console.log('🔄 Actualizando:', result);
    } else {
      result = await supabase.from('vuelos').insert([data]);
      console.log('➕ Insertando:', result);
    }
    
    if (result.error) {
      console.error('❌ Error:', result.error);
      showToast('Error: ' + result.error.message, 'danger');
    } else {
      showToast(id ? 'Vuelo actualizado' : 'Vuelo agregado', 'success');
      bootstrap.Modal.getInstance(document.getElementById('modalVuelo')).hide();
      e.target.reset();
      renderVuelos();
      actualizarEstadisticas();
    }
  } catch (error) {
    console.error('❌ Excepción:', error);
    showToast('Error al guardar', 'danger');
  }
});

// ========== ESTADÍSTICAS ==========
async function actualizarEstadisticas() {
  const { data: vuelos } = await supabase.from('vuelos').select('id');
  const { data: reservas } = await supabase.from('reservas').select('id').neq('estado', 'cancelada');
  const { data: pagos } = await supabase.from('pagos').select('monto');
  
  const ganancias = pagos?.reduce((s, p) => s + (p.monto || 0), 0) || 0;
  
  document.getElementById('totalVuelos').textContent = vuelos?.length || 0;
  document.getElementById('totalReservas').textContent = reservas?.length || 0;
  document.getElementById('totalGanancias').textContent = `$${ganancias.toLocaleString()}`;
}

// Formulario Usuario
// Formulario Usuario - VERSIÓN CORREGIDA CON ENCRIPTACIÓN
document.getElementById('formUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('usuarioId').value;
  const nombre = document.getElementById('nombreUsuario').value;
  const email = document.getElementById('emailUsuario').value;
  const rol = document.getElementById('rolUsuario').value;
  const password = document.getElementById('passwordUsuario').value;
  
  console.log('📝 Datos a guardar:', { nombre, email, rol });
  
  try {
    if (id) {
      // Actualizar usuario existente
      const updateData = { nombre, email, rol };
      if (password) {
        updateData.password = encriptarPassword(password);  // ← Encriptar si hay nueva contraseña
      }
      
      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      showToast('Usuario actualizado', 'success');
      
    } else {
      // Crear nuevo usuario con contraseña encriptada
      const passwordFinal = password || 'temp123';
      const passwordEncriptada = encriptarPassword(passwordFinal);
      
      const nuevoUsuario = {
        id: crypto.randomUUID(),
        nombre: nombre,
        email: email.toLowerCase().trim(),
        password: passwordEncriptada,  // ← CONTRASEÑA ENCRIPTADA
        rol: rol,
        isverified: true,
        created_at: new Date().toISOString()
      };
      
      console.log('📝 Insertando usuario:', { ...nuevoUsuario, password: '***' });
      
      const { error, data } = await supabase
        .from('usuarios')
        .insert([nuevoUsuario])
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
        showToast('Error: ' + error.message, 'danger');
        return;
      }
      
      console.log('✅ Usuario creado:', data);
      showToast('Usuario agregado correctamente', 'success');
    }
    
    // Cerrar modal y recargar
    bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
    document.getElementById('formUsuario').reset();
    renderUsuarios();
    
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('Error al guardar: ' + error.message, 'danger');
  }
});

// Botones de agregar
document.getElementById('btnAgregarVuelo').addEventListener('click', () => {
  document.getElementById('vueloId').value = '';
  document.getElementById('formVuelo').reset();
  new bootstrap.Modal(document.getElementById('modalVuelo')).show();
});

document.getElementById('btnAgregarUsuario').addEventListener('click', () => {
  document.getElementById('usuarioId').value = '';
  document.getElementById('formUsuario').reset();
  new bootstrap.Modal(document.getElementById('modalUsuario')).show();
});

// Búsqueda de vuelos
document.getElementById('btnBuscarVuelo').addEventListener('click', async () => {
  const term = document.getElementById('buscarVuelo').value.toLowerCase();
  const { data: vuelos } = await supabase.from('vuelos').select('*');
  const filtrados = vuelos.filter(v => v.origen.toLowerCase().includes(term) || v.destino.toLowerCase().includes(term));
  const tbody = document.getElementById('tablaVuelos');
  tbody.innerHTML = filtrados.map(v => `
    <tr>
      <td><small>${v.id.substring(0, 8)}</small></td>
      <td>${v.origen}</td>
      <td>${v.destino}</td>
      <td>${new Date(v.fecha).toLocaleDateString()}</td>
      <td>$${v.precio}</td>
      <td><button class="btn btn-sm btn-outline-primary editarVuelo" data-id="${v.id}">Editar</button></td>
    </tr>
  `).join('');
});

// Pestañas
document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(`tab${btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)}`).style.display = 'block';
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ========== INICIALIZAR ==========
renderVuelos();
renderReservas();
renderUsuarios();