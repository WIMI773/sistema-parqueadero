# Arquitectura del Sistema - Diagrama de Flujo

## 🏗️ Estructura de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    APP COMPONENT                        │
│                   (app.component)                       │
└──────────────┬──────────────────────────────────────────┘
               │
               ├── RouterOutlet
               │
    ┌──────────┴──────────────────────────────────────┐
    │                   ROUTING                        │
    │              (app.routes.ts)                    │
    └──────────────┬─────────────────────────────────┘
                   │
    ┌──────────────┴────────────────────────────────────────────┐
    │                   COMPONENTES                              │
    │                                                             │
    ├─ LOGIN (LoginComponent)                                   │
    │   ├─ AuthService                                          │
    │   └─ Router (redirige a /home)                           │
    │                                                             │
    ├─ HOME (HomeComponent) ⭐ [PROTEGIDO]                      │
    │   ├─ ParqueaderoService                                   │
    │   ├─ AuthService                                          │
    │   ├─ Dashboard con estadísticas                           │
    │   └─ Links a otros módulos                                │
    │                                                             │
    ├─ REGISTRO (RegistroComponent) ⭐ [PROTEGIDO]             │
    │   ├─ ParqueaderoService                                   │
    │   │  ├─ registrarEntrada()                                │
    │   │  ├─ registrarSalida()                                 │
    │   │  └─ obtenerVehiculosDentro()                          │
    │   ├─ Tabs (Entrada/Salida)                                │
    │   └─ Gestión de pagos                                     │
    │                                                             │
    ├─ HISTORIAL (HistorialComponent) ⭐ [PROTEGIDO]           │
    │   ├─ ParqueaderoService                                   │
    │   │  ├─ obtenerHistorial()                                │
    │   │  └─ registrarPago()                                   │
    │   ├─ Filtros avanzados                                    │
    │   └─ Exportar CSV                                         │
    │                                                             │
    └─ CONFIGURACION (ConfiguracionComponent) ⭐ [PROTEGIDO]   │
        ├─ ParqueaderoService                                   │
        │  ├─ obtenerConfiguracion()                            │
        │  └─ actualizarConfiguracion()                         │
        └─ Formulario de ajustes                                │
```

---

## 📊 Flujo de Datos

### Entrada de Vehículo

```
┌─────────────────┐
│ Registro Entry  │
│ (Usuario)       │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Validar:                 │
│ - Placa no vacía         │
│ - No está dentro         │
│ - Hay cupos disponibles  │
└────────┬─────────────────┘
         │
         ├─ ✗ Error
         │  └─> mostrarError()
         │
         └─ ✓ Ok
            │
            ▼
    ┌────────────────────────┐
    │ ParqueaderoService     │
    │ registrarEntrada()     │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Crear objeto Registro  │
    │ - id, placa, fecha     │
    │ - tipo: "entrada"      │
    │ - horaEntrada          │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Guardar en:            │
    │ - Array registros[]    │
    │ - Map vehiculos        │
    │ - localStorage         │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Actualizar            │
    │ estadísticas$         │
    │ (Observable)          │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Notificar componente   │
    │ - Mostrar éxito        │
    │ - Actualizar lista     │
    │ - Limpiar formulario   │
    └────────────────────────┘
```

### Salida de Vehículo

```
┌─────────────────┐
│ Registro Salida │
│ (Usuario)       │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ Validar:                     │
│ - Placa no vacía             │
│ - Existe entrada previa      │
└────────┬─────────────────────┘
         │
         ├─ ✗ Error
         │  └─> mostrarError()
         │
         └─ ✓ Ok
            │
            ▼
    ┌─────────────────────────┐
    │ ParqueaderoService      │
    │ registrarSalida()       │
    └────────┬────────────────┘
             │
             ├─ Obtener registro entrada
             │
             ├─ Calcular duración
             │  └─ (horaSalida - horaEntrada) / 60
             │
             ├─ Calcular tarifa
             │  └─ Math.ceil(duracion) * tarifaPorHora
             │
             └─> Crear Registro Salida
                │
                ▼
    ┌──────────────────────────┐
    │ Guardar Registro Salida  │
    │ - id, placa, fecha       │
    │ - tipo: "salida"         │
    │ - horaSalida             │
    │ - duracion (minutos)     │
    │ - tarifa (COP)           │
    │ - pagado: false          │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Remover de Map           │
    │ vehiculosDentro.delete() │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Actualizar              │
    │ estadísticas$           │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Mostrar:                 │
    │ - Card con pago pendiente│
    │ - Monto a cobrar        │
    │ - Opción registrar pago │
    └──────────────────────────┘
```

---

## 🔐 Sistema de Autenticación

```
LOGIN PAGE
   │
   ├─ Usuario: admin
   ├─ Contraseña: 1234
   │
   ▼
AuthService.login()
   │
   ├─ Validar credenciales
   │  (usuario === 'admin' && password === '1234')
   │
   ├─ ✓ Correcto
   │  └─> localStorage.setItem('isLogged', 'true')
   │      Router.navigate(['/home'])
   │
   └─ ✗ Incorrecto
      └─> error = 'Usuario o contraseña incorrectos'

PROTECCIÓN DE RUTAS
   │
   └─> authGuard
       │
       ├─ auth.isAuthenticated()
       │  └─> localStorage.getItem('isLogged') === 'true'
       │
       ├─ ✓ Autenticado
       │  └─> Acceso permitido
       │
       └─ ✗ No autenticado
          └─> Router.navigate(['/login'])
```

---

## 💾 Persistencia de Datos

### Estructura de localStorage

```json
{
  "isLogged": "true",
  "parqueadero_datos": {
    "registros": [
      {
        "id": "1704700000000-abc123",
        "vehiculoId": "ABC-123",
        "placa": "ABC-123",
        "tipo": "entrada",
        "fecha": "2024-01-07T10:30:00.000Z",
        "horaEntrada": "2024-01-07T10:30:00.000Z",
        "pagado": false
      },
      {
        "id": "1704700600000-def456",
        "vehiculoId": "ABC-123",
        "placa": "ABC-123",
        "tipo": "salida",
        "fecha": "2024-01-07T11:30:00.000Z",
        "horaSalida": "2024-01-07T11:30:00.000Z",
        "duracion": 60,
        "tarifa": 5000,
        "pagado": false
      }
    ],
    "vehiculosDentro": [
      ["ABC-123", { ...registro }],
      ["XYZ-789", { ...registro }]
    ],
    "config": {
      "cuposTotal": 50,
      "tarifaPorHora": 5000,
      "tarifaMoto": 2000,
      "tarifaCamion": 8000,
      "horaApertura": "06:00",
      "horaCierre": "22:00"
    }
  }
}
```

---

## 🔄 Observable Reactivo

### Estadísticas en Tiempo Real

```
ParqueaderoService
    │
    └─> estadisticasSubject: BehaviorSubject<EstadisticasParqueadero>
            │
            ├─ vehiculosDentro: number
            ├─ cuposDisponibles: number
            ├─ cuposOcupados: number
            ├─ totalRecaudado: number
            ├─ totalEntradas: number
            ├─ totalSalidas: number
            └─ ingresoPromedio: number
            │
            ▼
        public estadisticas$ = observable
            │
            ├─ HomeComponent
            │  └─ Se suscribe y actualiza card
            │
            └─ HistorialComponent
               └─ Se suscribe para calcular totales
```

---

## 📋 Interfaz de Datos (TypeScript)

```typescript
// Vehículo
Vehiculo {
  id: string;
  placa: string;
  tipo: 'auto' | 'moto' | 'camion';
  propietario?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

// Registro de Operación
Registro {
  id: string;
  vehiculoId: string;
  placa: string;
  tipo: 'entrada' | 'salida';
  fecha: Date;
  horaEntrada?: Date;
  horaSalida?: Date;
  duracion?: number;      // minutos
  tarifa?: number;        // COP
  pagado: boolean;
}

// Configuración
ConfiguracionParqueadero {
  cuposTotal: number;
  tarifaPorHora: number;
  tarifaMoto: number;
  tarifaCamion: number;
  horaApertura: string;   // "HH:MM"
  horaCierre: string;     // "HH:MM"
}

// Estadísticas
EstadisticasParqueadero {
  vehiculosDentro: number;
  cuposDisponibles: number;
  cuposOcupados: number;
  totalRecaudado: number;
  totalEntradas: number;
  totalSalidas: number;
  ingresoPromedio: number;
}
```

---

## 🎨 Estilos y Temas

```
Color Scheme
├─ Primario: #667eea (Azul Violeta)
├─ Secundario: #764ba2 (Púrpura)
├─ Éxito: #28a745 (Verde)
├─ Advertencia: #ffc107 (Amarillo)
├─ Peligro: #f5576c (Rojo)
├─ Fondo: Gradiente (667eea → 764ba2)
└─ Texto: #333 (Gris Oscuro)

Tipografía
├─ Font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
├─ Headers: Bold (700)
├─ Body: Regular (400)
└─ Labels: Semi-bold (600)

Espaciado
├─ Padding: 15px - 40px
├─ Margin: 10px - 30px
├─ Gap: 10px - 20px
└─ Border Radius: 5px - 12px
```

---

## 🚀 Flujo de Aplicación Completo

```
USER
  │
  ├─ Abre navegador
  │
  ▼
LOGIN PAGE
  │
  ├─ Ingresa credenciales (admin/1234)
  │
  ▼
AuthService.login()
  │
  ├─ ✓ Validado
  │
  ▼
DASHBOARD (HOME)
  │
  ├─ Visualiza estadísticas
  ├─ Ve actividad reciente
  │
  ├─ Opción 1: REGISTRAR
  │  ├─ Entrada/Salida
  │  └─ Gestión de pagos
  │
  ├─ Opción 2: HISTORIAL
  │  ├─ Filtros
  │  └─ Exportar CSV
  │
  └─ Opción 3: CONFIGURACIÓN
     ├─ Ajustar tarifas
     └─ Cambiar capacidad

  ├─ Cerrar sesión
  │
  ▼
LOGOUT
  │
  └─ localStorage.removeItem('isLogged')
     Router.navigate(['/login'])
```

---

**Diagrama de Arquitectura - Sistema de Parqueadero v1.0**  
*Última actualización: Enero 2024*
