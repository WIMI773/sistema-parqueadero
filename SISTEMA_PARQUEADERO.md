# 🚗 Sistema de Control de Parqueadero

Un sistema profesional y moderno de gestión de parqueadero desarrollado con **Angular 17+** y **TypeScript**.

## 📋 Características Principales

### 1. **Autenticación y Seguridad**
- ✅ Sistema de login seguro
- ✅ Protección de rutas con Guards
- ✅ Sesiones persistentes (localStorage)
- 🔐 Credenciales de prueba: `admin` / `1234`

### 2. **Dashboard Principal**
- 📊 Estadísticas en tiempo real
  - Vehículos dentro del parqueadero
  - Cupos disponibles
  - Total recaudado
  - Ingreso promedio
- 📋 Actividad reciente
- ⏰ Reloj en vivo

### 3. **Registro de Vehículos**
- ➕ **Entrada de vehículos**
  - Captura de placa
  - Selección de tipo (Auto, Moto, Camión)
  - Validación automática
  - Registro con timestamp

- ⏱️ **Salida de vehículos**
  - Cálculo automático de duración
  - Generación de tarifa según duración
  - Sistema de pagos integrado
  - Validación de vehículos registrados

### 4. **Historial y Reportes**
- 📊 Filtros avanzados
  - Por tipo (entrada/salida)
  - Por estado de pago
  - Pendientes y pagados
- 💾 Exportación a CSV
- 📈 Estadísticas de recaudación
  - Total recaudado
  - Monto pendiente
  - Cantidad de registros

### 5. **Configuración del Sistema**
- ⚙️ Parámetros ajustables
  - Cupos totales
  - Tarifas por tipo de vehículo
  - Horarios de operación
- 🔄 Reinicio de configuración a valores por defecto
- 💾 Persistencia de datos

## 🛠️ Tecnologías Utilizadas

```
Angular 17+
TypeScript 5+
RxJS (Reactive Programming)
CSS 3 (Flexbox, Grid, Gradients)
LocalStorage API
```

## 📦 Estructura del Proyecto

```
src/
├── app/
│   ├── pages/
│   │   ├── login/           # Componente de autenticación
│   │   ├── home/            # Dashboard principal
│   │   ├── registro/        # Entrada/Salida de vehículos
│   │   ├── historial/       # Reportes e historial
│   │   └── configuracion/   # Configuración del sistema
│   ├── services/
│   │   ├── auth.service.ts  # Autenticación
│   │   └── parqueadero.service.ts  # Lógica principal
│   ├── models/
│   │   └── parqueadero.models.ts   # Interfaces TypeScript
│   ├── guards/
│   │   └── auth.guard.ts    # Protección de rutas
│   ├── app.routes.ts        # Configuración de rutas
│   └── app.config.ts        # Configuración de la app
└── index.html
```

## 🚀 Guía de Uso

### Instalación

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Credenciales de Prueba

- **Usuario:** admin
- **Contraseña:** 1234

### Flujo Principal

1. **Inicia sesión** con las credenciales de prueba
2. **En el Dashboard:**
   - Visualiza estadísticas en tiempo real
   - Accede a las diferentes secciones

3. **Registrar Vehículos:**
   - Click en "Registrar Entrada/Salida"
   - Ingresa la placa del vehículo
   - Selecciona tipo (para entrada)
   - Registra la operación

4. **Consultar Historial:**
   - Filtra por tipo de operación
   - Descarga reportes en CSV
   - Visualiza pendientes de pago

5. **Configuración:**
   - Ajusta tarifas
   - Modifica capacidad
   - Define horarios

## 📊 Modelos de Datos

### Vehículo
```typescript
interface Vehiculo {
  id: string;
  placa: string;
  tipo: 'auto' | 'moto' | 'camion';
  propietario: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}
```

### Registro
```typescript
interface Registro {
  id: string;
  vehiculoId: string;
  placa: string;
  tipo: 'entrada' | 'salida';
  fecha: Date;
  horaEntrada?: Date;
  horaSalida?: Date;
  duracion?: number; // en minutos
  tarifa?: number;
  pagado: boolean;
}
```

## 💾 Almacenamiento

Los datos se guardan en **localStorage** con la clave `parqueadero_datos`. Incluye:
- Historial de registros
- Vehículos dentro del parqueadero
- Configuración personalizada

## 🎨 Diseño y UX

- **Interfaz moderna y responsiva**
- **Gradientes profesionales** (#667eea a #764ba2)
- **Animaciones suaves** y transiciones
- **Soporte móvil completo**
- **Modo claro** con excelente contraste
- **Iconos emoji** para accesibilidad visual

## ⚡ Optimizaciones

- ✅ Componentes standalone (sin módulos)
- ✅ RxJS para reactividad
- ✅ OnDestroy para limpiar suscripciones
- ✅ CSS modular por componente
- ✅ Validación de datos en tiempo real
- ✅ Persistencia automática

## 🔧 Funcionalidades Avanzadas

### Sistema de Tarifas Dinámicas
- Tarifa diferenciada por tipo de vehículo
- Cálculo por hora redondeado hacia arriba
- Integración con historial de pagos

### Validaciones Automáticas
- No permite entrada de vehículos duplicados
- Valida cupos disponibles
- Verifica registros de salida

### Reportes
- Exportación en formato CSV
- Filtros múltiples
- Estadísticas de recaudación

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge (últimas versiones)
- ✅ Tablets y móviles
- ✅ Pantallas pequeñas (responsive)

## 🔐 Seguridad

- Autenticación basada en localStorage
- Guards de ruta
- Validación de datos
- Limpieza automática de suscripciones

## 📝 Licencia

Este proyecto es de uso interno.

## 👨‍💻 Desarrollado por

**GitHub Copilot**

---

## 🎯 Mejoras Futuras

- [ ] Autenticación con servidor (API)
- [ ] Base de datos real (Firebase, MongoDB)
- [ ] Roles y permisos avanzados
- [ ] Notificaciones push
- [ ] Gráficos estadísticos mejorados
- [ ] Sistema de multas y tarifas especiales
- [ ] Integración con cámaras
- [ ] QR/Barcode scanning
- [ ] Aplicación móvil nativa
- [ ] Dark mode

---

**Versión:** 1.0.0  
**Estado:** ✅ Funcional
