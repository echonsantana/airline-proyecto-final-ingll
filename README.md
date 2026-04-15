# Universidad Autonoma de Santo Domingo (UASD)
#Ingenieria de Software ll
# Profesor:José Manuel Amado

Grupo #4

Integrantes:
-- Yan Carlos A. Fernández Fernández, 
-- Juan Carlos Nuñez Estevez, 	      
-- Johadimil Rivera De La Rosa, 	  
-- Edidson Rodriguez Santana, 	      
-- Alejandra Rosario Arias, 	      

#  Proyecto final: 
# ✈️ Airline Reservations - Sistema de Reserva de Vuelos 
# link de la pagina: https://echonsantana.github.io/airline-proyecto-final-ingll/index.html

Sistema completo de reserva de vuelos con panel administrativo, sistema de lealtad y gestión de pagos.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (ES6+)
- **Backend:** Supabase (PostgreSQL + API REST)
- **Autenticación:** Supabase Auth + encriptación personalizada
- **Despliegue:** Vite + Netlify / Vercel

---

## 📦 Estructura de Base de Datos

### 1. Tabla `usuarios`
```sql
create table usuarios (
  id text primary key,
  email text unique,
  password text,
  nombre text,
  rol text,
  puntos integer default 0,
  isverified boolean,
  createdat timestamp
);

create table vuelos (
  id uuid primary key default uuid_generate_v4(),
  numero text,
  origen text,
  destino text,
  fecha date,
  hora_salida time,
  precio numeric,
  estado text
);

create table reservas (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references usuarios(id),
  vuelo_id uuid references vuelos(id),
  asientos text[],
  clase text,
  total numeric,
  estado text default 'confirmada',
  created_at timestamp default now()
);

create table pagos (
  id uuid primary key default uuid_generate_v4(),
  reserva_id uuid references reservas(id),
  metodo text,
  monto numeric,
  estado text,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS puntos_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  puntos INTEGER NOT NULL,
  reserva_id UUID REFERENCES reservas(id),
  monto NUMERIC,
  clase TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservas_pendientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  vuelo_id UUID REFERENCES vuelos(id) ON DELETE CASCADE,
  asientos TEXT[],
  total NUMERIC,
  clase TEXT DEFAULT 'economica',
  timestamp TIMESTAMP DEFAULT NOW(),
  expira TIMESTAMP DEFAULT NOW() + INTERVAL '30 minutes',
  estado TEXT DEFAULT 'pendiente'
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_reservas_pendientes_usuario ON reservas_pendientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_pendientes_expira ON reservas_pendientes(expira);

-- Función para limpiar reservas expiradas
CREATE OR REPLACE FUNCTION limpiar_reservas_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM reservas_pendientes WHERE expira < NOW();
END;
$$ LANGUAGE plpgsql;
------

🎯 Funcionalidades Principales
Para Usuarios
🔍 Búsqueda de vuelos por origen, destino y fecha
✈️ Selección de asientos con mapa interactivo
💳 Proceso de pago simulado (validación de tarjeta)
📋 Historial de reservas con estado (pendiente/pagada/cancelada)
⭐ Sistema de puntos de lealtad (1 punto por cada $10 gastados)
📧 Notificaciones por email (simuladas)

Para Administradores (admin.html)
📊 Panel de control con estadísticas en tiempo real
✈️ CRUD completo de vuelos (crear, leer, editar, eliminar)
👥 CRUD de usuarios con cambio de roles
💰 Visualización de todas las reservas y pagos
🔒 Seguridad: solo usuarios con rol admin pueden acceder

📋 Flujo de Reserva
Seleccionar vuelo → Elegir asiento y clase
Confirmar reserva → Se guarda en reservas_pendientes (30 min de expiración)
Completar pago → Validación de tarjeta
Reserva confirmada → Se crea en reservas y pagos
Ganar puntos → Se calculan y guardan en puntos_historial


# Clonar repositorio
git clone https://github.com/echonsantana/airline-proyecto-final-ingll

# Instalar dependencias
npm install

# Configurar variables de entorno (.env)
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build


Airline Reservations/
├── index.html              # Página principal
├── admin.html              # Panel administrativo
├── reservas.html           # Mis reservas
├── src/
│   ├── main.js             # Lógica principal
│   ├── interfaz.js         # UI y eventos
│   ├── admin.js            # Panel admin
│   ├── controladores.js    # Lógica de negocio
│   └── services/
│       ├── supabaseClient.js 
│       ├── supabaseService.js
│       ├── authService.js
│       ├── loyaltyService.js           # Sistema de puntos de lealtad (1 punto por cada $10 gastados)
│       └── emailNotificationService.js # Simulacion de email por consola
└── package.json



