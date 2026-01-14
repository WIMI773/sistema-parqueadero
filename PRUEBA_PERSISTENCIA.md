# Prueba de Persistencia de Datos

## Pasos para probar que los datos se guardan correctamente:

### 1. **Abre el navegador en http://localhost:4200**
   - Abre las DevTools (F12)
   - Ve a la pestaña "Console"

### 2. **Login**
   - Usuario: cualquiera (ej: "admin")
   - Contraseña: cualquiera
   - Click en "Ingresar"

### 3. **Ve a Registro** y registra una entrada:
   - Placa: ABC123
   - Tipo: Auto
   - Operación: Entrada
   - Click en "Registrar"
   - Deberías ver un mensaje ✓ Entrada registrada

### 4. **Verifica en Console que se guardó:**
   ```javascript
   // Ejecuta en la consola del navegador:
   JSON.parse(localStorage.getItem('parqueadero_datos'))
   ```
   - Deberías ver un objeto con:
     - `registros`: array con la entrada registrada
     - `vehiculosDentro`: array con [["ABC123", {...registro...}]]
     - `config`: configuración del parqueadero

### 5. **Recarga la página** (F5)
   - Deberías ver en la consola: "✅ Datos cargados correctamente del localStorage"
   - Verifica que el vehículo sigue en el dashboard

### 6. **Verifica en Registro:**
   - Ve a la pestaña "Registro"
   - Deberías ver "ABC123" en la sección "Vehículos dentro"

---

## Si los datos NO se cargan:

1. **Abre la consola (F12) y busca errores rojos** - cualquier error se mostrará
2. **Verifica que localStorage tiene datos:**
   ```javascript
   localStorage.getItem('parqueadero_datos')
   ```
3. **Limpia localStorage y reinicia:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

---

## Información de Depuración:

Los logs que deberías ver en la consola:
- ✅ Datos guardados en localStorage → Cuando se registra entrada/salida
- ✅ Datos cargados correctamente del localStorage → Al recargar la página
- ℹ️ No hay datos guardados, usando valores por defecto → Primera vez

Si no ves estos logs, hay un problema con el servicio.

---

## Archivos Modificados Recientemente:

- `src/app/services/parqueadero.service.ts` - Serialización/deserialización mejorada
- `src/app/pages/home/home.component.ts` - Comentarios actualizados
