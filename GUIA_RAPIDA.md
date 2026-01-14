# Guía Rápida - Sistema de Parqueadero

## 🚀 Inicio Rápido

### Paso 1: Inicia el servidor
```bash
npm start
```

### Paso 2: Abre el navegador
```
http://localhost:4200
```

### Paso 3: Inicia sesión
- **Usuario:** `admin`
- **Contraseña:** `1234`

---

## 📋 Menú Principal (Dashboard)

Una vez logueado, verás:

### Cards de Estadísticas
- **🚗 Vehículos Dentro:** Número actual de vehículos en el parqueadero
- **🅿️ Cupos Disponibles:** Espacios libres
- **💰 Recaudado Hoy:** Total de dinero cobrado
- **📊 Ingreso Promedio:** Tarifa promedio por vehículo

### Botones de Acción
1. **➕ Registrar Entrada/Salida**
   - Accede al módulo de registro de vehículos
   - Permite entrada y salida

2. **📊 Historial y Reportes**
   - Visualiza todos los registros
   - Descarga reportes en CSV
   - Filtra por tipo y estado

3. **⚙️ Configuración**
   - Ajusta tarifas
   - Modifica capacidad total
   - Define horarios

---

## 📝 Cómo Registrar un Vehículo

### Registrar Entrada

1. Click en **"Registrar Entrada/Salida"**
2. Selecciona la tab **"Entrada"**
3. Ingresa la **placa** (ej: ABC-123)
4. Selecciona **tipo de vehículo:**
   - 🚗 Auto
   - 🏍️ Moto
   - 🚛 Camión
5. Click en **"Registrar Entrada"**

✅ Si es exitoso, verás un mensaje verde

### Registrar Salida

1. Click en **"Registrar Entrada/Salida"**
2. Selecciona la tab **"Salida"**
3. Ingresa la **placa del vehículo**
4. Click en **"Registrar Salida"**

📌 Sistema calcula automáticamente:
- Hora dentro del parqueadero
- Duración en horas/minutos
- Tarifa según configuración
- Estado de pago

### Registrar Pago

1. Después de registrar salida, aparece card con detalles
2. Click en **"Registrar Pago"**
3. ✅ Pago marcado como completado

---

## 📊 Consultar Historial

1. Click en **"Historial y Reportes"**
2. Verás tres cards:
   - **Recaudado:** Total de pagos completados
   - **Pendiente:** Dinero que falta cobrar
   - **Total Registros:** Cantidad de operaciones

### Filtros Disponibles
- **Todos:** Todos los registros
- **Entradas:** Solo registros de entrada
- **Salidas:** Solo registros de salida
- **Pagados:** Solo con pago completado
- **Pendientes:** Sin pago

### Descargar Reporte
- Click en **"📥 Descargar CSV"**
- Se descarga archivo con toda la información

---

## ⚙️ Configuración del Sistema

1. Click en **"Configuración"**
2. Ajusta los valores:

### Capacidad
- **Cupos Totales:** Espacios del parqueadero (máx 50)

### Tarifas
- **Tarifa por Hora (Autos):** Precio estándar
- **Tarifa por Hora (Motos):** Precio especial
- **Tarifa por Hora (Camiones):** Precio especial

### Horarios
- **Hora de Apertura:** (Ej: 06:00)
- **Hora de Cierre:** (Ej: 22:00)

3. Click en **"💾 Guardar Configuración"**
4. ✅ Cambios guardados

---

## 🔍 Datos de Ejemplo

### Placas para Pruebas
```
ABC-123   ← Auto
XYZ-789   ← Moto
DEF-456   ← Camión
GHI-321   ← Auto
```

### Tarifas Predeterminadas
- Auto: $5,000 por hora
- Moto: $2,000 por hora
- Camión: $8,000 por hora

---

## 💡 Tips Útiles

✨ **Actualización en Tiempo Real**
- Las estadísticas se actualizan automáticamente
- El reloj se actualiza cada segundo

📱 **Responsivo**
- Funciona en desktop y móvil
- Interfaz se adapta automáticamente

💾 **Persistencia de Datos**
- Todos los datos se guardan localmente
- Los registros se conservan al cerrar navegador

⌨️ **Atajos de Teclado**
- Presiona ENTER para enviar formularios
- Válido en login, registro y configuración

---

## ❓ Preguntas Frecuentes

**¿Qué pasa si cierro sesión?**
- Los datos se conservan
- Debes volver a loguearte

**¿Puedo editar registros anteriores?**
- No, los registros son inmutables
- Son solo consulta e información

**¿Dónde se guardan los datos?**
- LocalStorage del navegador
- Si limpias el caché, se pierden

**¿Cómo recupero contraseña?**
- No hay sistema de recuperación (demo)
- Usa: admin / 1234

---

## 🚨 Errores Comunes

| Problema | Solución |
|----------|----------|
| "Vehículo ya está registrado" | El auto ya está dentro. Registra salida primero |
| "No hay cupos disponibles" | Parqueadero lleno. Registra alguna salida |
| "No se encontró entrada" | Intenta salida sin entrada previa |
| "Cupos debe ser mayor a 0" | Ingresa un valor válido en configuración |

---

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Revisa la documentación completa en `SISTEMA_PARQUEADERO.md`
2. Verifica que los datos sean válidos
3. Intenta refrescar la página

---

**¡Disfruta usando el Sistema de Parqueadero! 🚗✨**
